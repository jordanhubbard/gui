module.exports = {
    'Alerts & Reporting': function(browser) {
        browser
            .press('.CascadingListItem:nth-child(1) .SectionRoot-entries .List-item:nth-child(8)')
            .waitForElementVisible('.CascadingListItem:nth-child(2) div.SystemSection.alert');
        browser.expect.element('.CascadingListItem:nth-child(2) div.Viewer .Viewer-title').text.to.equal('Alert Filters').before(1000);
        browser.expect.element('.CascadingListItem:nth-child(2) div.SystemSection div.Alert').to.be.present.before(1000);
    },
    'Create an Alert Filter': function(browser) {
        browser
            .press('.CascadingListItem:nth-child(2) div.Viewer .Viewer-createButton')
            .waitForElementVisible('.CascadingListItem:nth-child(3) div.AlertFilter');
        browser.expect.element('.CascadingListItem:nth-child(3) div.AlertFilter .Inspector-header').text.to.equal('Create an Alert filter').before(1000);
    }
};
