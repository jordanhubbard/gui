import {SystemRepository} from '../repository/system-repository';
import {CryptoCertificateType} from '../model/enumerations/CryptoCertificateType';
import {CryptoCertificateRepository} from '../repository/crypto-certificate-repository';
import {AlertFilterRepository} from '../repository/alert-filter-repository';
import {MailRepository} from '../repository/mail-repository';
import {TunableRepository} from '../repository/tunable-repository';
import {NtpServerRepository} from '../repository/ntp-server-repository';
import {AbstractRoute} from './abstract-route';
import {Model} from '../model';
import * as _ from 'lodash';

export class SystemRoute extends AbstractRoute {
    private static instance: SystemRoute;
    private objectType: string;

    private constructor(private systemRepository: SystemRepository,
                        private cryptoCertificateRepository: CryptoCertificateRepository,
                        private alertFilterRepository: AlertFilterRepository,
                        private mailRepository: MailRepository,
                        private tunableRepository: TunableRepository,
                        private ntpServerRepository: NtpServerRepository) {
        super();
        this.objectType = Model.SystemSection;
    }

    public static getInstance() {
        if (!SystemRoute.instance) {
            SystemRoute.instance = new SystemRoute(
                SystemRepository.getInstance(),
                CryptoCertificateRepository.getInstance(),
                AlertFilterRepository.getInstance(),
                MailRepository.getInstance(),
                TunableRepository.getInstance(),
                NtpServerRepository.getInstance()
            );
        }
        return SystemRoute.instance;
    }

    public get(systemSectionId: string, stack: Array<any>) {
        let self = this,
            columnIndex = 1,
            parentContext = stack[columnIndex - 1],
            context: any = {
                columnIndex: columnIndex,
                objectType: this.objectType,
                parentContext: parentContext,
                path: parentContext.path + '/system-section/_/' + systemSectionId
            };
        return Promise.all([
            this.systemRepository.listSystemSections(),
            this.modelDescriptorService.getUiDescriptorForType(this.objectType)
        ]).spread(function(systemSections: Array<any>, uiDescriptor) {
            context.object = _.find(systemSections, {id: systemSectionId});
            context.userInterfaceDescriptor = uiDescriptor;

            return self.updateStackWithContext(stack, context);
        });
    }

    public getCertificate(certificateId: string, stack: Array<any>) {
        let self = this,
            objectType = Model.CryptoCertificate,
            columnIndex = 2,
            parentContext = stack[columnIndex - 1],
            context: any = {
                columnIndex: columnIndex,
                objectType: objectType,
                parentContext: parentContext,
                path: parentContext.path + '/crypto-certificate/_/' + encodeURIComponent(certificateId)
            };
        return Promise.all([
            this.cryptoCertificateRepository.listCryptoCertificates(),
            this.modelDescriptorService.getUiDescriptorForType(objectType)
        ]).spread(function(certificates: Array<any>, uiDescriptor) {
            context.object = _.find(certificates, {id: certificateId});
            context.userInterfaceDescriptor = uiDescriptor;

            return self.updateStackWithContext(stack, context);
        });
    }

    public selectNewCertificateType(stack: Array<any>) {
        let self = this,
            objectType = Model.CryptoCertificate,
            columnIndex = 2,
            parentContext = stack[columnIndex - 1],
            context: any = {
                columnIndex: columnIndex,
                objectType: objectType,
                parentContext: parentContext,
                isCreatePrevented: true,
                path: parentContext.path + '/create'
            };
        return Promise.all([
            Promise.all(_.map(_.keys(CryptoCertificateType), (type) => this.cryptoCertificateRepository.getNewCryptoCertificate(type))),
            this.modelDescriptorService.getUiDescriptorForType(objectType)
        ]).spread(function(cryptoCertificates: Array<any>, uiDescriptor) {
            (cryptoCertificates as any)._objectType = objectType;
            context.object = _.compact(cryptoCertificates);
            context.userInterfaceDescriptor = uiDescriptor;

            return self.updateStackWithContext(stack, context);
        });
    }

    public createCertificate(certificateType: string, stack: Array<any>) {
        let self = this,
            objectType = Model.CryptoCertificate,
            columnIndex = 2,
            parentContext = stack[columnIndex],
            context: any = {
                columnIndex: columnIndex,
                objectType: objectType,
                parentContext: parentContext,
                path: parentContext.path + '/' + certificateType
            };
        return Promise.all([
            this.modelDescriptorService.getUiDescriptorForType(objectType)
        ]).spread(function(uiDescriptor) {
            let share = _.find(parentContext.object, {_tmpId: certificateType});
            context.userInterfaceDescriptor = uiDescriptor;
            context.object = share;

            return self.updateStackWithContext(stack, context);
        });
    }

    public getAlertFilter(filterId: string, stack: Array<any>) {
        let self = this,
            objectType = Model.AlertFilter,
            columnIndex = 2,
            parentContext = stack[columnIndex - 1],
            context: any = {
                columnIndex: columnIndex,
                objectType: objectType,
                parentContext: parentContext,
                path: parentContext.path + '/alert-filter/_/' + encodeURIComponent(filterId)
            };
        return Promise.all([
            this.alertFilterRepository.listAlertFilters(),
            this.modelDescriptorService.getUiDescriptorForType(objectType)
        ]).spread(function(alertFilters: Array<any>, uiDescriptor) {
            context.object = _.find(alertFilters, {id: filterId});
            context.userInterfaceDescriptor = uiDescriptor;

            return self.updateStackWithContext(stack, context);
        });
    }

    public createAlertFilter(stack: Array<any>) {
        let self = this,
            objectType = Model.AlertFilter,
            columnIndex = 2,
            parentContext = stack[columnIndex - 1],
            context: any = {
                columnIndex: columnIndex,
                objectType: objectType,
                parentContext: parentContext,
                path: parentContext.path + '/create'
            };
        return Promise.all([
            this.alertFilterRepository.getNewAlertFilter(),
            this.modelDescriptorService.getUiDescriptorForType(objectType)
        ]).spread(function(alertFilter, uiDescriptor) {
            context.object = alertFilter;
            context.userInterfaceDescriptor = uiDescriptor;

            return self.updateStackWithContext(stack, context);
        });
    }

    public getAlertSettings(stack: Array<any>) {
        let self = this,
            objectType = Model.Mail,
            columnIndex = 2,
            parentContext = stack[columnIndex - 1],
            context: any = {
                columnIndex: columnIndex,
                objectType: objectType,
                parentContext: parentContext,
                path: parentContext.path + '/settings'
            };
        return Promise.all([
            this.mailRepository.getConfig(),
            this.modelDescriptorService.getUiDescriptorForType(objectType)
        ]).spread(function(mailConfig, uiDescriptor) {
            context.object = mailConfig;
            context.userInterfaceDescriptor = uiDescriptor;

            return self.updateStackWithContext(stack, context);
        });
    }

    public createTunable(stack: Array<any>) {
        let self = this,
            objectType = Model.Tunable,
            columnIndex = 2,
            parentContext = stack[columnIndex - 1],
            context: any = {
                columnIndex: columnIndex,
                objectType: objectType,
                parentContext: parentContext,
                path: parentContext.path + '/create'
            };
        return Promise.all([
            this.tunableRepository.getNewTunable(),
            this.modelDescriptorService.getUiDescriptorForType(objectType)
        ]).spread(function(tunable, uiDescriptor) {
            context.object = tunable;
            context.userInterfaceDescriptor = uiDescriptor;

            return self.updateStackWithContext(stack, context);
        });
    }

    public getTunable(tunableId: string, stack: Array<any>) {
        let self = this,
            objectType = Model.Tunable,
            columnIndex = 2,
            parentContext = stack[columnIndex - 1],
            context: any = {
                columnIndex: columnIndex,
                objectType: objectType,
                parentContext: parentContext,
                path: parentContext.path + '/tunable/_/' + encodeURIComponent(tunableId)
            };
        return Promise.all([
            this.tunableRepository.listTunables(),
            this.modelDescriptorService.getUiDescriptorForType(objectType)
        ]).spread(function(tunables: Array<any>, uiDescriptor) {
            context.object = _.find(tunables, {id: tunableId});
            context.userInterfaceDescriptor = uiDescriptor;

            return self.updateStackWithContext(stack, context);
        });
    }

    public createNtpServer(stack: Array<any>) {
        let self = this,
            objectType = Model.NtpServer,
            columnIndex = 2,
            parentContext = stack[columnIndex - 1],
            context: any = {
                columnIndex: columnIndex,
                objectType: objectType,
                parentContext: parentContext,
                path: parentContext.path + '/create'
            };
        return Promise.all([
            this.ntpServerRepository.getNewNtpServer(),
            this.modelDescriptorService.getUiDescriptorForType(objectType)
        ]).spread(function(ntpServer, uiDescriptor) {
            context.object = ntpServer;
            context.userInterfaceDescriptor = uiDescriptor;

            return self.updateStackWithContext(stack, context);
        });
    }

    public getNtpServer(ntpServerId: string, stack: Array<any>) {
        let self = this,
            objectType = Model.NtpServer,
            columnIndex = 2,
            parentContext = stack[columnIndex - 1],
            context: any = {
                columnIndex: columnIndex,
                objectType: objectType,
                parentContext: parentContext,
                path: parentContext.path + '/ntp-server/_/' + encodeURIComponent(ntpServerId)
            };
        return Promise.all([
            this.ntpServerRepository.listNtpServers(),
            this.modelDescriptorService.getUiDescriptorForType(objectType)
        ]).spread(function(ntpServers: Array<any>, uiDescriptor) {
            context.object = _.find(ntpServers, {id: ntpServerId});
            context.userInterfaceDescriptor = uiDescriptor;

            return self.updateStackWithContext(stack, context);
        });
    }

}

