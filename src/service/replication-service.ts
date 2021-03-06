import {ReplicationRepository} from '../repository/replication-repository';
import {SystemRepository} from '../repository/system-repository';
import {MiddlewareClient} from './middleware-client';
import * as _ from 'lodash';
import {Model} from '../model';

export class ReplicationService {
    private static instance: ReplicationService;

    private hostPromise: Promise<string>;

    public constructor(private systemRepository: SystemRepository,
                       private middlewareClient: MiddlewareClient,
                       private replicationRepository: ReplicationRepository) {}

    public static getInstance(): ReplicationService {
        if (!ReplicationService.instance) {
            ReplicationService.instance = new ReplicationService(
                SystemRepository.getInstance(),
                MiddlewareClient.getInstance(),
                ReplicationRepository.getInstance()
            );
        }
        return ReplicationService.instance;
    }

    public listReplications(): Promise<any> {
        return this.replicationRepository.listReplications();
    }

    public listReplicationsForVolume(volume: string): Promise<any> {
        return Promise.all([
            this.replicationRepository.listReplications(),
            this.getHostUuid()
        ]).spread((replications, host) => _.filter(replications, (replication: any) =>
                (replication.master === host && replication.datasets[0].master.startsWith(volume)) ||
                    (replication.slave === host && replication.datasets[0].slave.startsWith(volume))
            ));
    }

    public listReplicationsForDataset(dataset: string): Promise<any> {
        return Promise.all([
            this.replicationRepository.listReplications(),
            this.getHostUuid()
        ]).spread((replications, host) => _.filter(replications, (replication: any) =>
                (replication.master === host && replication.datasets[0].master === dataset) ||
                    (replication.slave === host && replication.datasets[0].slave === dataset)
            ));
    }

    public extractTransportOptions(replication) {
        let result: any = {},
            length = replication.transport_options ? replication.transport_options.length || Object.keys(replication.transport_options).length : 0,
            option, i;

        for (i = 0; i < length; i++) {
            option = replication.transport_options[i];
            if (option['%type'] === 'compress-replication-transport-option') {
                result.compress = option.level;
            } else if (option['%type'] === 'encrypt-replication-transport-option') {
                result.encrypt = option.type;
            } else if (option['%type'] === 'throttle-replication-transport-option') {
                result.throttle = option.buffer_size;
            }
        }

        return result;
    }

    public buildTransportOptions(options) {
        let promises = [];

        if (options.encrypt) {
            promises.push(
                this.replicationRepository
                    .getNewReplicationTransportOptionInstance(Model.EncryptReplicationTransportOption)
                    .then(option => _.set(option, 'type', options.encrypt))
            );
        }
        if (options.compress) {
            promises.push(
                this.replicationRepository
                    .getNewReplicationTransportOptionInstance(Model.CompressReplicationTransportOption)
                    .then(option => _.set(option, 'level', options.compress))
            );
        }
        if (options.throttle) {
            promises.push(
                this.replicationRepository
                    .getNewReplicationTransportOptionInstance(Model.ThrottleReplicationTransportOption)
                    .then(option => _.set(option, 'buffer_size', options.throttle))
            );
        }

        return Promise.all(promises);
    }

    public getNewReplicationInstance() {
        return Promise.all([
            this.replicationRepository.getNewReplicationInstance(),
            this.getHostUuid()
        ]).spread((replication, host) => {
            replication.master = host;
            replication.datasets = [{}];
            return replication;
        });
    }

    private getHostUuid(): Promise<string> {
        return this.hostPromise = this.hostPromise || this.middlewareClient.callRpcMethod('system.info.host_uuid');
    }
}
