sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "sap/m/MessageToast"
], function(Controller, JSONModel, History, MessageToast) {
    "use strict";
    return Controller.extend("com.ttl.accessmentor.controller.CRView", {
        onInit: function() {
            var oModel = new JSONModel({
                crTypeIndex: 0, // 0 = functional, 1 = technical
                crSections: []
            });
            this.getView().setModel(oModel);
        },
        onCrTypeSelect: function(oEvent) {
            // Optionally handle radio change
        },
        onCrApplyPress: function() {
            var oModel = this.getView().getModel();
            var crTypeIndex = oModel.getProperty("/crTypeIndex");
            var sections = [];
            if (crTypeIndex === 1) { // technical
                sections = [
                    { title: "Execute DB Commands from SAP", users: this._getMockUsers() },
                    { title: "Define & Execute External OS Commands", users: this._getMockUsers() },
                    { title: "Copy of Change Tables via Data Browser", users: this._getMockUsers() },
                    { title: "Copy of Change Client Dependent Tables via Table Maintenance", users: this._getMockUsers() },
                    { title: "Maintain User Master Records", users: this._getMockUsers() },
                    { title: "Assign Roles (CHANGE) to User IDs", users: this._getMockUsers() },
                    { title: "Assign Roles (ASSIGN) to User IDs", users: this._getMockUsers() }
                ];
            } else { // functional
                sections = [
                    { title: "Maintain Asset Document AND Maintain Asset Master Data", users: this._getMockUsers() },
                    { title: "Release Purchase Orders", users: this._getMockUsers() },
                    { title: "Maintain Purchase Order AND Process Vendor Invoice (MM)", users: this._getMockUsers() },
                    { title: "Process Goods Receipt for Purchase Order AND Process Vendor Invoice (MM)", users: this._getMockUsers() },
                    { title: "Maintain Vendor Master Data (FI View)", users: this._getMockUsers() }
                ];
            }
            oModel.setProperty("/crSections", sections);
        },
        onDownloadPress: function() {
            var oModel = this.getView().getModel();
            var crTypeIndex = oModel.getProperty("/crTypeIndex");
            var crSections = oModel.getProperty("/crSections");
            
            if (!crSections || crSections.length === 0) {
                MessageToast.show("Please apply a selection first to generate PDF");
                return;
            }
            
            this._generateAndDownloadPDF(crTypeIndex, crSections);
        },
        _generateAndDownloadPDF: function(crTypeIndex, crSections) {
            // Create HTML content for PDF
            var htmlContent = this._createPDFHTML(crTypeIndex, crSections);
            
            // Create blob and download
            var blob = new Blob([htmlContent], { type: 'text/html' });
            var url = window.URL.createObjectURL(blob);
            var a = document.createElement('a');
            a.href = url;
            a.download = 'CR_Report_' + (crTypeIndex === 1 ? 'Technical' : 'Functional') + '_' + new Date().toISOString().split('T')[0] + '.html';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            MessageToast.show("Report downloaded successfully");
        },
        _createPDFHTML: function(crTypeIndex, crSections) {
            var typeText = crTypeIndex === 1 ? 'Technical' : 'Functional';
            var html = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>CR Report - ${typeText}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { text-align: center; margin-bottom: 30px; }
        .section { margin-bottom: 30px; page-break-inside: avoid; }
        .section-title { background-color: #f0f0f0; padding: 10px; font-weight: bold; margin-bottom: 10px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; font-weight: bold; }
        .checkbox { text-align: center; }
        .checked { color: #007bff; font-weight: bold; }
        .unchecked { color: #6c757d; }
        @media print {
            body { margin: 0; }
            .section { page-break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Change Request Report</h1>
        <h2>Type: ${typeText}</h2>
        <p>Generated on: ${new Date().toLocaleString()}</p>
    </div>
`;
            
            crSections.forEach(function(section) {
                html += `
    <div class="section">
        <div class="section-title">${section.title}</div>
        <table>
            <thead>
                <tr>
                    <th>User ID</th>
                    <th>User Name</th>
                    <th>User Type</th>
                    <th>User Validity</th>
                    <th>Lock Status</th>
                    <th>Valid</th>
                    <th>Invalid</th>
                    <th>Pending</th>
                </tr>
            </thead>
            <tbody>
`;
                
                section.users.forEach(function(user) {
                    html += `
                <tr>
                    <td>${user.userId}</td>
                    <td>${user.userName}</td>
                    <td>${user.userType}</td>
                    <td>${user.userValidity}</td>
                    <td>${user.lockStatus}</td>
                    <td class="checkbox ${user.valid ? 'checked' : 'unchecked'}">${user.valid ? '✓' : '✗'}</td>
                    <td class="checkbox ${user.invalid ? 'checked' : 'unchecked'}">${user.invalid ? '✓' : '✗'}</td>
                    <td class="checkbox ${user.pending ? 'checked' : 'unchecked'}">${user.pending ? '✓' : '✗'}</td>
                </tr>
`;
                });
                
                html += `
            </tbody>
        </table>
    </div>
`;
            });
            
            html += `
</body>
</html>`;
            
            return html;
        },
        _getMockUsers: function() {
            // Replace with real data as needed
            return [
                { userId: "U001", userName: "John Doe", userType: "Dialog", userValidity: "2023-01-01 to 2024-01-01", lockStatus: "Unlocked", valid: true, invalid: false, pending: false },
                { userId: "U002", userName: "Jane Smith", userType: "System", userValidity: "2023-02-01 to 2024-02-01", lockStatus: "Locked", valid: true, invalid: false, pending: false }
            ];
        },
        onCrStatusCheckBoxSelect: function(oEvent) {
            var oItem = oEvent.getSource().getParent().getParent(); // ColumnListItem
            var oCtx = oItem.getBindingContext();
            var oData = oCtx.getObject();
            // oData.valid, oData.invalid, oData.pending will be updated automatically if two-way binding is enabled
            console.log('Status changed:', oData);
        },
        onNavBack: function () {
            console.log('hey');
            var oHistory = History.getInstance();
            console.log(oHistory)
            var sPreviousHash = oHistory.getPreviousHash();
        
            if (sPreviousHash !== undefined) {
                window.history.go(-1); // Navigate back in browser history
            } else {
                // fallback - e.g., go to default route
                var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
                oRouter.navTo("RouteView1", {}, true); // Replace "home" with your route name
            }
        }
    });
}); 