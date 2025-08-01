sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], (Controller, JSONModel) => {
    "use strict";

    return Controller.extend("com.ttl.accessmentor.controller.View1", {
        onInit() {
            // Initialize the model with mock data
            this._initializeModel();
            // Set default role type filter
            this.getView().getModel().setProperty("/roleTypeFilter", "standard");
        },

        _initializeModel: function () {
            // Mock data as requested
            var mockData = {
                query: "",
                tcodes: [],

                extendedData: {
                },
                // UI state properties
                availableRoles: [],
                selectedRoleSOD: "",
                selectedRoleTcodes: [],
                selectedTCodesCount: 0,
                selectedRolesCount: 0,
                hasSOD: false,
                noSODVisible: false,
                selectRoleVisible: true,
                showAddTCodeInput: false,
                newTCodeValue: "",
                isOwnSelected: true,
                isOtherSelected: false,
                otherSapId: "",
                sodTableData: [],
                showSODTable: false,
                tcodeBusy: false,
                roleBusy: false,
                infoCenterBusy: false,
                sodBusy: false,
                showStandardRoles: true,
                showNonStandardRoles: true,
                sodHighCount: 0,
                sodMediumCount: 0,
                sodLowCount: 0,
                riskDetailsData: [],
                includeMitigationRisk: true
            };

            var oModel = new JSONModel(mockData);
            this.getView().setModel(oModel);
        },

        //for query change to write query
        onQueryChange: function (oEvent) {
            var oView = this.getView();
            var oVBox = oView.byId("tcodeVBox");
            var oModel = this.getView().getModel();

            oModel.setProperty("/tcodeBusy", true);
            oVBox.addStyleClass("busyTop");
            var sQuery = oEvent.getParameter("query").toUpperCase();
            var oData = oModel.getData();

            // Reset selections
            this._resetSelections();

            if (sQuery.trim() === "") {
                // Reset to NULL
                oModel.setProperty("/query", "");
                oModel.setProperty("/tcodes", "");
                oVBox.removeStyleClass("busyTop"); // Reset top after load
                oModel.setProperty("/tcodeBusy", false);
                return;
            }

            // Check if we have specific data for this query
            if (oData.extendedData[sQuery]) {
                var queryData = oData.extendedData[sQuery];
                oModel.setProperty("/query", queryData.query);
                oModel.setProperty("/tcodes", queryData.tcodes);
            } else {
                // Filter based on query
                var aFilteredTcodes = oData.tcodes.filter(function (tcode) {
                    return tcode.code.includes(sQuery) ||
                        tcode.roles.some(function (role) {
                            return role.name.includes(sQuery);
                        });
                });

                oModel.setProperty("/query", sQuery);
                oModel.setProperty("/tcodes", aFilteredTcodes);
            }

            oModel.setProperty("/tcodeBusy", false);
            oVBox.removeStyleClass("busyTop");

        },

        //radio selection change to choose SAP ID
        onRadioSelect: function (oEvent) {
            var oModel = this.getView().getModel();
            var sText = oEvent.getSource().getText();
            if (sText === "Self") {
                oModel.setProperty("/isOwnSelected", true);
                oModel.setProperty("/isOtherSelected", false);
            } else {
                oModel.setProperty("/isOwnSelected", false);
                oModel.setProperty("/isOtherSelected", true);
            }
        },


        //function to display the list of the roles when you click on T-code
        onTCodeSelectionChange: async function (oEvent) {
            const oView = this.getView();
            const oList = oEvent.getSource();
            var oVBox = oView.byId("roleVBox");
            const aSelectedItems = oList.getSelectedItems();
            const oModel = this.getView().getModel(); // Local JSON model
            const oODataModel = this.getOwnerComponent().getModel(); // OData service
            console.log(oODataModel);
            var isOwnSelected = oModel.getProperty("/isOwnSelected");
            var isOtherSelected = oModel.getProperty("/isOtherSelected");
            var sUser = "";
            if (isOtherSelected) {
                sUser = oModel.getProperty("/otherSapId") || "";
            }
            // If Own is selected, sUser remains blank

            // Show loading indicator
            oModel.setProperty("/roleBusy", true);
            oVBox.addStyleClass("busyTop");

            // Update selected property for all T-codes
            const aAllTcodes = oModel.getProperty("/tcodes") || [];
            const aSelectedTCodes = aSelectedItems.map(item => item.getBindingContext().getProperty("code"));

            aAllTcodes.forEach(tcode => {
                tcode.selected = aSelectedTCodes.includes(tcode.code);
            });
            oModel.setProperty("/tcodes", aAllTcodes);

            // Array to collect roles
            let aAvailableRoles = [];

            for (const oItem of aSelectedItems) {
                const sTCode = oItem.getBindingContext().getProperty("code");
                const sFilter = `Tcode eq '${sTCode}' and TestUser eq '${sUser}'`;
                console.log(sFilter)

                try {
                    const oData = await new Promise(resolve => {
                        oODataModel.read("/Get_roleSet", {
                            urlParameters: { "$filter": sFilter },
                            success: data => resolve(data),
                            error: () => resolve({ results: [] })
                        });
                    });

                    aAvailableRoles = aAvailableRoles.concat(oData.results || []);
                } catch (err) {
                    console.error(`Failed to fetch roles for ${sTCode}`, err);
                }
            }

            // Deduplicate roles by Roles or name property
            const seen = new Set();
            const aUniqueRoles = aAvailableRoles.filter(role => {
                const key = role.Roles || role.name;
                if (seen.has(key)) {
                    return false;
                }
                seen.add(key);
                return true;
            });

            // Update the model with unique roles and count
            oModel.setProperty("/_allAvailableRoles", aUniqueRoles);
            this.onRoleTypeCheckboxSelect();
            oModel.setProperty("/selectedTCodesCount", aSelectedItems.length);

            // Clear role selections if no T-codes are selected
            if (aSelectedItems.length === 0) {
                const oRoleList = this.getView().byId("roleList");
                oRoleList.removeSelections();
                oModel.setProperty("/selectedRoles", []);
                oModel.setProperty("/selectedRolesCount", 0);
            } else {
                // If some T-codes are still selected, we need to validate existing role selections
                // against the new available roles to remove orphaned selections
                const oRoleList = this.getView().byId("roleList");
                const aCurrentSelectedRoles = oModel.getProperty("/selectedRoles") || [];
                const aAvailableRoleNames = aUniqueRoles.map(role => role.Roles || role.name);

                // Filter out roles that are no longer available
                const aValidSelectedRoles = aCurrentSelectedRoles.filter(roleName =>
                    aAvailableRoleNames.includes(roleName)
                );

                // Update the model with only valid role selections
                oModel.setProperty("/selectedRoles", aValidSelectedRoles);
                oModel.setProperty("/selectedRolesCount", aValidSelectedRoles.length);

                // Clear visual selections and reapply only valid ones
                oRoleList.removeSelections();

                // Re-select only the valid roles
                aValidSelectedRoles.forEach(roleName => {
                    const aItems = oRoleList.getItems();
                    for (let i = 0; i < aItems.length; i++) {
                        const oItem = aItems[i];
                        const oData = oItem.getBindingContext().getObject();
                        if ((oData.Roles || oData.name) === roleName) {
                            oRoleList.setSelectedItem(oItem, true);
                            break;
                        }
                    }
                });
            }

            oModel.setProperty("/roleBusy", false);
            oVBox.removeStyleClass("busyTop");

            // Update the UI
            this._updateUIState();
        },

        //function to display the t-code name and t-code description in infor center
        onTCodePress: function (oEvent) {
            const oView = this.getView();
            const oVBox = oView.byId("infoCenterVBox");
            oVBox.addStyleClass("busyTop");
            var oModel = this.getView().getModel();
            var oTCode = oEvent.getSource().getBindingContext().getObject();
            var oODataModel = this.getOwnerComponent().getModel();
            var sTCode = oTCode.code;
            if (!sTCode) return;
            oModel.setProperty("/infoCenterBusy", true);
            var sFilter = `Tcode eq '${sTCode}'`;
            oODataModel.read("/all_tcodeSet", {
                urlParameters: { "$filter": sFilter },
                success: function (data) {
                    // Expecting data.results to be array of { Tcode, TcodeDesc }
                    const validTcodes = data.results.map(item => ({
                        code: item.Tcode,
                        description: item.RoleDesc ? item.RoleDesc : 'No description available'
                    }));
                    oModel.setProperty("/selectedRoleTcodes", validTcodes);
                    oModel.setProperty("/infoCenterBusy", false);
                    oVBox.removeStyleClass("busyTop");
                },
                error: function () {
                    oModel.setProperty("/selectedRoleTcodes", []);
                    oModel.setProperty("/infoCenterBusy", false);
                    oVBox.removeStyleClass("busyTop");
                }
            });
        },

        onTCodeDeletePress: function (oEvent) {
            const oButton = oEvent.getSource();
            const oListItem = oButton.getParent().getParent();
            const oBindingContext = oListItem.getBindingContext();
            const sTCode = oBindingContext.getProperty("code");
            const oModel = this.getView().getModel();

            // Get current T-codes array
            const aTcodes = oModel.getProperty("/tcodes") || [];

            // Remove the T-code from the array
            const aUpdatedTcodes = aTcodes.filter(tcode => tcode.code !== sTCode);

            // Update the model
            oModel.setProperty("/tcodes", aUpdatedTcodes);
            oModel.setProperty("/selectedTCodesCount", aUpdatedTcodes.length);

            // Clear role list selections and reset role-related properties
            const oRoleList = this.getView().byId("roleList");
            oRoleList.removeSelections();
            oModel.setProperty("/selectedRoles", []);
            oModel.setProperty("/selectedRolesCount", 0);
            oModel.setProperty("/availableRoles", []);
            oModel.setProperty("/_allAvailableRoles", []);

            // Clear SOD data when no roles are selected
            oModel.setProperty("/sodTableData", []);
            oModel.setProperty("/showSODTable", false);
            oModel.setProperty("/sodHighCount", 0);
            oModel.setProperty("/sodMediumCount", 0);
            oModel.setProperty("/sodLowCount", 0);
            oModel.setProperty("/_originalSodData", []);

            // Simply call onTCodeSelectionChange to handle everything
            const oList = this.getView().byId("tcodeList");
            this.onTCodeSelectionChange({ getSource: () => oList });

            // Show success message
            sap.m.MessageToast.show(`T-Code ${sTCode} removed successfully`);
        },


        //this function not required now as we will use button to check SOD
        onRoleSelectionChange: function (oEvent) {
            var oList = this.byId("roleList");
            var aSelectedItems = oList.getSelectedItems();
            var oModel = this.getView().getModel();
            var aValidSelectedItems = [];
            var aSelectedRoles = [];

            // Loop through selected items
            aSelectedItems.forEach(function (oItem) {
                var oCtx = oItem.getBindingContext();
                var oData = oCtx.getObject();
                if (oData.Exist === 'X') {
                    // Deselect invalid item
                    oList.setSelectedItem(oItem, false);
                    sap.m.MessageToast.show("Role '" + (oData.name || oData.Roles) + "' is already assigned.");
                } else {
                    aValidSelectedItems.push(oItem);
                    aSelectedRoles.push(oData.Roles || oData.name);
                }
            });

            // Save selected roles to model for restoration after filtering
            oModel.setProperty("/selectedRoles", aSelectedRoles);

            if (aSelectedItems.length > 0) {
                // Get the last selected role for SOD and T-Codes display
                var oLastSelected = aSelectedItems[aSelectedItems.length - 1];
                var oRole = oLastSelected.getBindingContext().getObject();
                oModel.setProperty("/selectedRoleSOD", oRole.sod);
                // oModel.setProperty("/selectedRoleTcodes", oRole.roleTcodes);
            }

            oModel.setProperty("/selectedRolesCount", aSelectedItems.length);

            // Clear SOD data if no roles are selected
            if (aSelectedItems.length === 0) {
                oModel.setProperty("/sodTableData", []);
                oModel.setProperty("/showSODTable", false);
                oModel.setProperty("/sodHighCount", 0);
                oModel.setProperty("/sodMediumCount", 0);
                oModel.setProperty("/sodLowCount", 0);
                oModel.setProperty("/_originalSodData", []); // Also clear original data
            }

            this._updateUIState();
        },

        //this function will help to get the t-code list in the that role and display it in infocenter
        onRolePress: function (oEvent) {
            const oView = this.getView();
            const oVBox = oView.byId("infoCenterVBox");
            oVBox.addStyleClass("busyTop");
            var oModel = this.getView().getModel();
            var oRole = oEvent.getSource().getBindingContext().getObject();
            var oODataModel = this.getOwnerComponent().getModel();
            var sRole = oRole.Roles || oRole.name; // OData or mock
            if (!sRole) return;
            oModel.setProperty("/infoCenterBusy", true);
            oVBox.addStyleClass("busyTop");
            var that = this;
            var sFilter = `Roles eq '${sRole}'`;
            oODataModel.read("/Get_TcodeSet", {
                urlParameters: { "$filter": sFilter },
                success: function (data) {
                    // Expecting data.results to be array of { Tcode, TcodeDesc }
                    var aTcodes = (data.results || []).map(function (item) {
                        return { code: item.Tcode, description: item.RoleDesc };
                    });
                    oModel.setProperty("/selectedRoleTcodes", aTcodes);
                    oModel.setProperty("/infoCenterBusy", false);
                    oVBox.removeStyleClass("busyTop");
                },
                error: function () {
                    oModel.setProperty("/selectedRoleTcodes", []);
                    oModel.setProperty("/infoCenterBusy", false);
                    oVBox.removeStyleClass("busyTop");
                }
            });
        },

        _resetSelections: function () {
            var oModel = this.getView().getModel();
            // Clear lists
            this.byId("tcodeList").removeSelections();
            this.byId("roleList").removeSelections();
            // Reset model properties
            oModel.setProperty("/tcodes", "");
            oModel.setProperty("/availableRoles", []);
            oModel.setProperty("/_allAvailableRoles", []);
            oModel.setProperty("/selectedRoleSOD", "");
            oModel.setProperty("/selectedRoleTcodes", []);
            oModel.setProperty("/selectedTCodesCount", 0);
            oModel.setProperty("/selectedRolesCount", 0);
            this._updateUIState();
        },

        _updateRoleSelectionState: function () {
            var oModel = this.getView().getModel();
            oModel.setProperty("/selectedRoleSOD", "");
            oModel.setProperty("/selectedRoleTcodes", []);
            oModel.setProperty("/selectedRolesCount", 0);
        },

        _updateUIState: function () {
            var oModel = this.getView().getModel();
            var sSOD = oModel.getProperty("/selectedRoleSOD");
            var iSelectedRoles = oModel.getProperty("/selectedRolesCount");

            // Update SOD visibility
            oModel.setProperty("/hasSOD", !!(sSOD && sSOD.length > 0));
            oModel.setProperty("/noSODVisible", iSelectedRoles > 0 && (!sSOD || sSOD.length === 0));
            oModel.setProperty("/selectRoleVisible", iSelectedRoles === 0);
        },

        //add new t-code in 1st column
        onAddTCodePress: function () {
            var oModel = this.getView().getModel();
            oModel.setProperty("/showAddTCodeInput", true);
            oModel.setProperty("/newTCodeValue", "");
        },

        /**
         * Validate T-codes against /all_tcodeSet OData service.
         * @param {Array} aTcodes - Array of {code, description}
         * @returns {Promise<Array>} - Array of valid {code, description} from backend
         */
        _validateTcodesWithOData: async function (aTcodes) {
            const oODataModel = this.getOwnerComponent().getModel();
            if (!aTcodes || aTcodes.length === 0) return [];
            // Build filter string for all T-codes
            const tcodeFilters = aTcodes.map(tc => `Tcode eq '${tc.code}'`).join(' or ');
            return new Promise((resolve) => {
                oODataModel.read("/all_tcodeSet", {
                    urlParameters: { "$filter": tcodeFilters },
                    success: function (data) {
                        // data.results: [{ Tcode, TcodeDesc }]
                        const validTcodes = data.results.map(item => ({
                            code: item.Tcode,
                            description: item.RoleDesc ? item.RoleDesc : 'No description available',
                            selected: false
                        }));
                        resolve(validTcodes);
                    },
                    error: function () {
                        resolve([]); // On error, return empty
                    }
                });
            });
        },

        //adding new t0de in 1st column
        onAddTCodeSubmit: async function (oEvent) {
            var oModel = this.getView().getModel();
            var sNewTCode = oModel.getProperty("/newTCodeValue");
            if (sNewTCode && sNewTCode.trim() !== "") {
                var aTcodes = oModel.getProperty("/tcodes") || [];
                // Validate with backend before adding
                var validTcodes = await this._validateTcodesWithOData([{ code: sNewTCode.toUpperCase() }]);
                if (validTcodes.length > 0) {
                    // Only add if exists in backend and set selected to false
                    validTcodes[0].selected = false;
                    aTcodes.push(validTcodes[0]);
                    oModel.setProperty("/tcodes", aTcodes);
                } else {
                    sap.m.MessageToast.show("T-Code '" + sNewTCode + "' does not exist in the system.");
                }
            }
            oModel.setProperty("/showAddTCodeInput", false);
            oModel.setProperty("/newTCodeValue", "");
        },





        /******************************* *************************/
        onSearchSubmit: async function (oEvent) {
            this._resetSelections();
            var oView = this.getView();
            var oVBox = oView.byId("tcodeVBox");
            const sQuery = oEvent.getParameter("query");
            const oModel = this.getView().getModel();
            // Show loading indicators
            oModel.setProperty("/tcodeBusy", true);
            oVBox.addStyleClass("busyTop");

            oModel.setProperty("/query", sQuery);

            if (!sQuery || sQuery.trim() === "") {
                oModel.setProperty("/query", "");
                oModel.setProperty("/tcodes", []);
                oVBox.removeStyleClass("busyTop"); // Reset top after load
                oModel.setProperty("/tcodeBusy", false);
                return;
            }

            // Get T-codes from ChatGPT
            const gptResult = await this._callHuggingFaceForTcodes(sQuery);
            // Validate with backend before displaying
            const validTcodes = await this._validateTcodesWithOData(gptResult);
            oModel.setProperty("/tcodes", validTcodes);

            // Hide loading indicators
            oModel.setProperty("/tcodeBusy", false);
            oVBox.removeStyleClass("busyTop");
        },

        _callHuggingFaceForTcodes: async function (queryText) {
            const apiKey = ""; // 🔐 Replace with your actual OpenAI API key
            const prompt = `You are an SAP expert. List SAP T-codes and Fiori app IDs needed for: "${queryText}". 

Use the SAP Fiori Apps Reference Library (https://fioriappslibrary.hana.ondemand.com/sap/fix/externalViewer/) to ensure accurate Fiori app IDs and descriptions.

Return JSON:
[
  { "type": "T-CODE", "code": "ME21N", "description": "Create Purchase Order" },
  { "type": "FIORI", "code": "F1873", "description": "Manage Sales Orders" }
]`;

            try {
                const response = await fetch("https://api.openai.com/v1/chat/completions", {
                    method: "POST",
                    headers: {
                        "Authorization": `Bearer ${apiKey}`,
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        model: "gpt-4o-mini",
                        messages: [
                            { role: "system", content: "You are an SAP expert assistant." },
                            { role: "user", content: prompt }
                        ],
                        temperature: 0.2,
                        max_tokens: 300
                    })
                });

                const data = await response.json();
                const content = data.choices?.[0]?.message?.content || "";

                // Remove all code fences and everything before the first [
                let contentClean = content.replace(/```[\s\S]*?```/g, match => match.replace(/```(?:json)?/gi, '').replace(/```/g, '')).trim();
                let firstBracket = contentClean.indexOf('[');
                if (firstBracket !== -1) {
                    let jsonPart = contentClean.substring(firstBracket);
                    // Try to find the last closing bracket for an object
                    let lastCurly = jsonPart.lastIndexOf('}');
                    if (lastCurly !== -1) {
                        let possibleArray = jsonPart.substring(0, lastCurly + 1);
                        // Try to ensure it ends with a closing array bracket
                        if (!possibleArray.trim().endsWith(']')) {
                            possibleArray += ']';
                        }
                        try {
                            return JSON.parse(possibleArray);
                        } catch (e) {
                            // Try to remove the last (possibly incomplete) object and parse again
                            let lastObj = possibleArray.lastIndexOf('},');
                            if (lastObj !== -1) {
                                let fixedArray = possibleArray.substring(0, lastObj + 1) + ']';
                                try {
                                    sap.m.MessageToast.show('The AI response was incomplete. Only partial data is shown.');
                                    return JSON.parse(fixedArray);
                                } catch (e2) {
                                    sap.m.MessageToast.show('The AI response was incomplete. Only partial data is shown.');
                                    console.warn('Failed to parse JSON after fix:', e2, fixedArray);
                                    return [];
                                }
                            }
                            sap.m.MessageToast.show('The AI response was incomplete or malformed. Please try again or rephrase your query.');
                            console.warn('OpenAI response format unrecognized:', e, possibleArray);
                            return [];
                        }
                    }
                }
                sap.m.MessageToast.show('The AI response was incomplete or malformed. Please try again or rephrase your query.');
                console.warn('OpenAI response format unrecognized:', content);
                return [];

            } catch (error) {
                console.error("OpenAI API error:", error);
                return [];
            }
        },

        onSendSODPress: function () {
            var oModel = this.getView().getModel();
            var oSodModel = this.getOwnerComponent().getModel("sod");
            console.log(oSodModel);
            var selectedRoles = oModel.getProperty("/selectedRoles") || [];
            var isOwnSelected = oModel.getProperty("/isOwnSelected");
            var isOtherSelected = oModel.getProperty("/isOtherSelected");
            var userId = "";
            if (isOtherSelected) {
                userId = oModel.getProperty("/otherSapId") || "";
            }
            // If Own is selected, userId remains blank

            if (!selectedRoles.length) {
                oModel.setProperty("/sodTableData", []);
                oModel.setProperty("/showSODTable", false);
                oModel.setProperty("/sodHighCount", 0);
                oModel.setProperty("/sodMediumCount", 0);
                oModel.setProperty("/sodLowCount", 0);
                sap.m.MessageToast.show("Please select at least one role.");
                return;
            }

            // Build filter array for UI5 ODataModel
            var aRoleFilters = selectedRoles.map(function (role) {
                return new sap.ui.model.Filter("Roles", sap.ui.model.FilterOperator.EQ, role);
            });
            var oRolesFilter = new sap.ui.model.Filter({
                filters: aRoleFilters,
                and: false // OR between roles
            });
            var oUserFilter = new sap.ui.model.Filter("User", sap.ui.model.FilterOperator.EQ, userId);
            // Combine roles (OR) and user (AND)
            var finalFilter = new sap.ui.model.Filter({
                filters: [oRolesFilter, oUserFilter],
                and: true
            });

            // Show busy indicator
            oModel.setProperty("/sodBusy", true);

            var that = this;

            oSodModel.read("/ZGRC_SODSet", {
                filters: [finalFilter],
                success: function (data) {
                    // Handle SOD results here
                    console.log("SOD API result:", data);
                    var sodResults = data.results || [];
                    oModel.setProperty("/sodTableData", sodResults);
                    oModel.setProperty("/showSODTable", true);

                    console.log(sodResults)

                    // Calculate unique risk level counts based on Risk ID + Rule ID + Risk Level combination
                    var highCount = 0, mediumCount = 0, lowCount = 0;
                    var uniqueHighRisks = new Set();
                    var uniqueMediumRisks = new Set();
                    var uniqueLowRisks = new Set();

                    sodResults.forEach(function (item) {
                        // Create unique key: Risk ID + Rule ID + Risk Level
                        var uniqueKey = item.Riskid + "_" + item.Risklevel;

                        switch (item.Risklevel) {
                            case "High":
                            case "Critical":
                                uniqueHighRisks.add(uniqueKey);
                                break;
                            case "Medium":
                                uniqueMediumRisks.add(uniqueKey);
                                break;
                            case "Low":
                                uniqueLowRisks.add(uniqueKey);
                                break;
                        }
                    });

                    // Get counts from unique sets
                    highCount = uniqueHighRisks.size;
                    mediumCount = uniqueMediumRisks.size;
                    lowCount = uniqueLowRisks.size;

                    oModel.setProperty("/sodHighCount", highCount);
                    oModel.setProperty("/sodMediumCount", mediumCount);
                    oModel.setProperty("/sodLowCount", lowCount);
                    oModel.setProperty("/sodBusy", false);

                    // Store original SOD data for filtering
                    oModel.setProperty("/_originalSodData", sodResults);

                    // Apply mitigation filter to the loaded data
                    that._applyMitigationFilter();

                    // Auto-open risk details dialog for first time
                    that._autoOpenRiskDetailsDialog(sodResults);
                },
                error: function (err) {
                    oModel.setProperty("/sodBusy", false);
                    sap.m.MessageToast.show("Failed to check SOD.");
                    console.error("SOD API error:", err);
                }
            });
        },

        onApplyPress: function () {
            // Handle Apply button press
            console.log("Apply button pressed");
            
            // Open selected roles dialog
            this._openSelectedRolesDialog();
        },

        /**
         * Filters the availableRoles array based on the current /roleTypeFilter value.
         */
        // _applyRoleTypeFilter: function() {
        //     var oModel = this.getView().getModel();
        //     var sFilter = oModel.getProperty("/roleTypeFilter");
        //     var aAllRoles = oModel.getProperty("/_allAvailableRoles") || oModel.getProperty("/availableRoles") || [];

        //     console.log(aAllRoles);
        //     var aFilteredRoles = aAllRoles.filter(function(role) {
        //         if (sFilter === "standard") {
        //             return role.Roles && role.Roles.toUpperCase().startsWith("SAP");
        //         } else {
        //             return !(role.Roles && role.Roles.toUpperCase().startsWith("SAP"));
        //         }
        //     });
        //     oModel.setProperty("/availableRoles", aFilteredRoles);
        // },

        /**
         * Handler for radio button selection change for role type filter.
         */
        // onRoleTypeRadioSelect: function(oEvent) {
        //     var oModel = this.getView().getModel();
        //     var sText = oEvent.getSource().getText();
        //     var sValue = (sText === "Standard") ? "standard" : "nonstandard";
        //     oModel.setProperty("/roleTypeFilter", sValue);
        //     this._applyRoleTypeFilter();
        // },

        onRoleTypeCheckboxSelect: function () {
            var oModel = this.getView().getModel();
            var showStandard = oModel.getProperty("/showStandardRoles");
            var showNonStandard = oModel.getProperty("/showNonStandardRoles");
            // Always filter from the full, original list
            var aAllRoles = oModel.getProperty("/_allAvailableRoles") || [];
            var aSelectedRoles = oModel.getProperty("/selectedRoles") || [];

            // Filter the roles based on Standard / Non-Standard
            var aFilteredRoles = aAllRoles.filter(function (role) {
                var roleName = role.Roles || role.name || "";
                var isStandard = roleName.toUpperCase().startsWith("SAP") || roleName.startsWith("/");
                return (showStandard && isStandard) || (showNonStandard && !isStandard);
            });

            // Set filtered list to model
            oModel.setProperty("/availableRoles", aFilteredRoles);

            // Reapply selection — only for still-selected roles
            setTimeout(function () {
                var oList = this.byId("roleList");
                var aListItems = oList.getItems();

                aListItems.forEach(function (oItem) {
                    var role = oItem.getBindingContext().getObject();
                    if (aSelectedRoles.includes(role.Roles)) {
                        oList.setSelectedItem(oItem, true);
                    } else {
                        oList.setSelectedItem(oItem, false);
                    }
                });
            }.bind(this), 0);
        },
        onRoleListUpdateFinished: function () {
            var oList = this.byId("roleList");
            var aItems = oList.getItems();

            aItems.forEach(function (oItem) {
                oItem.removeStyleClass("hideRoleCheckbox");
                var oContext = oItem.getBindingContext();
                if (!oContext) return;

                var oData = oContext.getObject();
                console.log(oData);
                if (oData.Exist === 'X') {
                    oItem.addStyleClass("hideRoleCheckbox");
                }
            });
        },

        onSodTableItemPress: function (oEvent) {
            var oItem = oEvent.getSource();
            var oCtx = oItem.getBindingContext();
            if (oCtx) {
                var oData = oCtx.getObject();
                console.log('Riskdesc:', oData.Riskdesc, 'Riskid:', oData.Riskid);
                // Set this data in selectedRoleTcodes for Info Center
                var oModel = this.getView().getModel();
                oModel.setProperty("/selectedRoleTcodes", [{
                    code: oData.Riskid || '',
                    description: oData.Riskdesc || ''
                }]);
            }
        },

        onSodFilterPress: function (oEvent) {
            var oDialog = this.getView().byId("sodFilterDialog");
            if (oDialog) {
                // Populate filter options from current SOD data
                this._populateSodFilterOptions();
                oDialog.open();
            }
        },

        onSodFilterApply: function (oEvent) {
            var oModel = this.getView().getModel();
            var oDialog = this.getView().byId("sodFilterDialog");

            // Get filter values safely
            var riskLevelSelect = this.getView().byId("riskLevelFilter");
            var riskLevel = riskLevelSelect ? riskLevelSelect.getSelectedKey() : "";
            var riskIdCombo = this.getView().byId("riskIdFilter");
            var riskId = riskIdCombo ? riskIdCombo.getSelectedKey() : "";
            var ruleIdCombo = this.getView().byId("ruleIdFilter");
            var ruleId = ruleIdCombo ? ruleIdCombo.getSelectedKey() : "";
            var actionCombo = this.getView().byId("actionFilter");
            var action = actionCombo ? actionCombo.getSelectedKey() : "";
            var roleCombo = this.getView().byId("roleFilter");
            var role = roleCombo ? roleCombo.getSelectedKey() : "";

            // Get original SOD data
            var originalData = oModel.getProperty("/_originalSodData") || oModel.getProperty("/sodTableData");

            // Store original data if not already stored
            if (!oModel.getProperty("/_originalSodData")) {
                oModel.setProperty("/_originalSodData", originalData);
            }

            // Apply filters
            var filteredData = originalData.filter(function (item) {
                var matches = true;

                if (riskLevel && item.Risklevel !== riskLevel) {
                    matches = false;
                }

                if (riskId && !item.Riskid.toLowerCase().includes(riskId.toLowerCase())) {
                    matches = false;
                }

                if (ruleId && !item.Actruleid.toLowerCase().includes(ruleId.toLowerCase())) {
                    matches = false;
                }

                if (action && !item.Action.toLowerCase().includes(action.toLowerCase())) {
                    matches = false;
                }

                if (role && !item.Role.toLowerCase().includes(role.toLowerCase())) {
                    matches = false;
                }

                return matches;
            });

            // Update table data
            oModel.setProperty("/sodTableData", filteredData);

            // Recalculate counts for filtered data
            this._recalculateSodCounts(filteredData);

            // Close dialog
            if (oDialog) {
                oDialog.close();
            }

            sap.m.MessageToast.show("Filter applied successfully");
        },

        onSodFilterClear: function (oEvent) {
            var oModel = this.getView().getModel();
            
            // Clear all filter inputs safely
            var riskLevelSelect = this.getView().byId("riskLevelFilter");
            var riskIdCombo = this.getView().byId("riskIdFilter");
            var ruleIdCombo = this.getView().byId("ruleIdFilter");
            var actionCombo = this.getView().byId("actionFilter");
            var roleCombo = this.getView().byId("roleFilter");

            if (riskLevelSelect) riskLevelSelect.setSelectedKey("");
            if (riskIdCombo) riskIdCombo.setSelectedKey("");
            if (ruleIdCombo) ruleIdCombo.setSelectedKey("");
            if (actionCombo) actionCombo.setSelectedKey("");
            if (roleCombo) roleCombo.setSelectedKey("");
            
            // Set mitigation checkbox to true by default when clearing filters
            oModel.setProperty("/includeMitigationRisk", true);
            
            // Update the checkbox control directly
            var mitigationCheckbox = this.getView().byId("mitigationCheckbox");
            if (mitigationCheckbox) {
                mitigationCheckbox.setSelected(true);
            }
            
            // Apply the filter to show all data
            this._applyMitigationFilter();
        },

        onSodFilterCancel: function (oEvent) {
            var oDialog = this.getView().byId("sodFilterDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onSodClearFilterInstant: function (oEvent) {
            var oModel = this.getView().getModel();

            // Restore original SOD data
            var originalData = oModel.getProperty("/_originalSodData");
            if (originalData) {
                oModel.setProperty("/sodTableData", originalData);
                this._recalculateSodCounts(originalData);
            }

            // Clear filter dialog inputs if dialog is open
            this.onSodFilterClear();

            sap.m.MessageToast.show("All filters cleared");
        },

        onSodInfoPress: function (oEvent) {
            var oModel = this.getView().getModel();
            var sodData = oModel.getProperty("/sodTableData");

            if (sodData && sodData.length > 0) {
                // Group risks by Risk Level
                var riskGroups = {};
                var seenRiskIds = {};

                sodData.forEach(function (item) {
                    if (item.Riskid && item.Risklevel) {
                        var riskLevel = item.Risklevel;

                        // Initialize group if not exists
                        if (!riskGroups[riskLevel]) {
                            riskGroups[riskLevel] = {
                                RiskLevel: riskLevel,
                                Risks: [],
                                RiskCount: 0
                            };
                        }

                        // Add unique risk to group
                        if (!seenRiskIds[item.Riskid]) {
                            seenRiskIds[item.Riskid] = true;
                            riskGroups[riskLevel].Risks.push({
                                Riskid: item.Riskid,
                                Riskdesc: item.Riskdesc || "No description available"
                            });
                            riskGroups[riskLevel].RiskCount++;
                        }
                    }
                });

                // Convert to array and sort by risk level (High, Medium, Low)
                var riskLevelOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
                var groupedRisks = Object.values(riskGroups).sort(function (a, b) {
                    return (riskLevelOrder[a.RiskLevel] || 999) - (riskLevelOrder[b.RiskLevel] || 999);
                });

                // Set the grouped risk details data
                oModel.setProperty("/riskDetailsData", groupedRisks);

                // Open the dialog
                var oDialog = this.getView().byId("sodRiskDetailsDialog");
                if (oDialog) {
                    oDialog.open();
                }
            } else {
                sap.m.MessageToast.show("No SOD data available to display");
            }
        },

        onSodRiskDetailsClose: function (oEvent) {
            var oDialog = this.getView().byId("sodRiskDetailsDialog");
            if (oDialog) {
                oDialog.close();
            }
        },

        onMitigationFilterSelect: function (oEvent) {
            var oModel = this.getView().getModel();
            var isChecked = oEvent.getParameter("selected");

            // Store the filter preference
            oModel.setProperty("/includeMitigationRisk", isChecked);

            // Apply the filter to current SOD data
            this._applyMitigationFilter();
        },

        _applyMitigationFilter: function () {
            var oModel = this.getView().getModel();
            var originalData = oModel.getProperty("/_originalSodData");
            var includeMitigation = oModel.getProperty("/includeMitigationRisk");

            if (!originalData || originalData.length === 0) {
                return;
            }

            var filteredData;

            if (includeMitigation) {
                // Include all risks (show everything)
                filteredData = originalData;
            } else {
                // Exclude risks that have both Accontrolid and Monitor values present
                filteredData = originalData.filter(function (item) {
                    var hasAccontrolid = item.Accontrolid && item.Accontrolid.trim() !== "";
                    var hasMonitor = item.Monitor && item.Monitor.trim() !== "";

                    // Exclude if both Accontrolid and Monitor have values
                    return !(hasAccontrolid && hasMonitor);
                });
            }

            // Update the table data
            oModel.setProperty("/sodTableData", filteredData);

            // Recalculate counts
            this._recalculateSodCounts(filteredData);
        },

        _openSelectedRolesDialog: function() {
            var oModel = this.getView().getModel();
            var selectedRoles = oModel.getProperty("/selectedRoles") || [];
            
            if (selectedRoles.length > 0) {
                // Set the selected roles data for the dialog
                oModel.setProperty("/selectedRoles", selectedRoles);
                console.log(selectedRoles);
                
                // Open the dialog
                var oDialog = this.getView().byId("selectedRolesDialog");
                if (oDialog) {
                    oDialog.open();
                }
            } else {
                sap.m.MessageToast.show("No roles selected");
            }
        },
        
        onCopyRolePress: function(oEvent) {
            var oContext = oEvent.getSource().getBindingContext();
            var roleName = oContext.getObject();
            
            if (roleName) {
                // Copy to clipboard
                navigator.clipboard.writeText(roleName).then(function() {
                    sap.m.MessageToast.show("Role copied to clipboard: " + roleName);
                }).catch(function(err) {
                    console.error('Failed to copy: ', err);
                    sap.m.MessageToast.show("Failed to copy role");
                });
            }
        },
        
        onSelectedRolesClose: function(oEvent) {
            var oDialog = this.getView().byId("selectedRolesDialog");
            if (oDialog) {
                oDialog.close();
            }
        },
        
        _autoOpenRiskDetailsDialog: function (sodData) {
            var oModel = this.getView().getModel();

            // Auto-open dialog every time SOD data is loaded
            if (sodData && sodData.length > 0) {

                // Use the same logic as onSodInfoPress to prepare data
                var riskGroups = {};
                var seenRiskIds = {};

                sodData.forEach(function (item) {
                    if (item.Riskid && item.Risklevel) {
                        var riskLevel = item.Risklevel;

                        // Initialize group if not exists
                        if (!riskGroups[riskLevel]) {
                            riskGroups[riskLevel] = {
                                RiskLevel: riskLevel,
                                Risks: [],
                                RiskCount: 0
                            };
                        }

                        // Add unique risk to group
                        if (!seenRiskIds[item.Riskid]) {
                            seenRiskIds[item.Riskid] = true;
                            riskGroups[riskLevel].Risks.push({
                                Riskid: item.Riskid,
                                Riskdesc: item.Riskdesc || "No description available",
                                Accontrolid: item.Accontrolid,
                                Monitor: item.Monitor
                            });
                            riskGroups[riskLevel].RiskCount++;
                        }
                    }
                });

                // Convert to array and sort by risk level (High, Medium, Low)
                var riskLevelOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
                var groupedRisks = Object.values(riskGroups).sort(function (a, b) {
                    return (riskLevelOrder[a.RiskLevel] || 999) - (riskLevelOrder[b.RiskLevel] || 999);
                });

                // Set the grouped risk details data
                oModel.setProperty("/riskDetailsData", groupedRisks);

                // Open the dialog
                var oDialog = this.getView().byId("sodRiskDetailsDialog");
                if (oDialog) {
                    oDialog.open();
                }
            }
        },

        _recalculateSodCounts: function (sodData) {
            var oModel = this.getView().getModel();

            // Calculate unique risk level counts based on Risk ID + Rule ID + Risk Level combination
            var highCount = 0, mediumCount = 0, lowCount = 0;
            var uniqueHighRisks = new Set();
            var uniqueMediumRisks = new Set();
            var uniqueLowRisks = new Set();

            sodData.forEach(function (item) {
                // Create unique key: Risk ID + Rule ID + Risk Level
                var uniqueKey = item.Riskid + "_" + item.Risklevel;

                switch (item.Risklevel) {
                    case "High":
                    case "Critical":
                        uniqueHighRisks.add(uniqueKey);
                        break;
                    case "Medium":
                        uniqueMediumRisks.add(uniqueKey);
                        break;
                    case "Low":
                        uniqueLowRisks.add(uniqueKey);
                        break;
                }
            });

            // Get counts from unique sets
            highCount = uniqueHighRisks.size;
            mediumCount = uniqueMediumRisks.size;
            lowCount = uniqueLowRisks.size;

            oModel.setProperty("/sodHighCount", highCount);
            oModel.setProperty("/sodMediumCount", mediumCount);
            oModel.setProperty("/sodLowCount", lowCount);
        },

        _populateSodFilterOptions: function () {
            var oModel = this.getView().getModel();
            var sodData = oModel.getProperty("/sodTableData") || [];

            // Extract unique values and their counts
            var riskIdMap = {};
            var ruleIdMap = {};
            var actionMap = {};
            var roleMap = {};

            sodData.forEach(function (item) {
                // Count Risk IDs
                if (item.Riskid) {
                    riskIdMap[item.Riskid] = (riskIdMap[item.Riskid] || 0) + 1;
                }

                // Count Rule IDs
                if (item.Actruleid) {
                    ruleIdMap[item.Actruleid] = (ruleIdMap[item.Actruleid] || 0) + 1;
                }

                // Count Actions
                if (item.Action) {
                    actionMap[item.Action] = (actionMap[item.Action] || 0) + 1;
                }

                // Count Roles
                if (item.Role) {
                    roleMap[item.Role] = (roleMap[item.Role] || 0) + 1;
                }
            });

            // Convert to arrays for binding
            var riskIds = Object.keys(riskIdMap).map(function (key) {
                return { RiskId: key, Count: riskIdMap[key] };
            });

            var ruleIds = Object.keys(ruleIdMap).map(function (key) {
                return { RuleId: key, Count: ruleIdMap[key] };
            });

            var actions = Object.keys(actionMap).map(function (key) {
                return { Action: key, Count: actionMap[key] };
            });

            var roles = Object.keys(roleMap).map(function (key) {
                return { Role: key, Count: roleMap[key] };
            });

            // Set the data to model
            oModel.setProperty("/sodRiskIds", riskIds);
            oModel.setProperty("/sodRuleIds", ruleIds);
            oModel.setProperty("/sodActions", actions);
            oModel.setProperty("/sodRoles", roles);
        },

        getRowHighlight: function (sRiskLevel) {
            switch (sRiskLevel) {
                case "Critical": return "Error";        // Red
                case "High": return "Error";          // Orange
                case "Medium": return "Indication08";    // Blue
                case "Low": return "Indication05";           // Green
                default: return "None";
            }
        },
        onHomeNavPress: function () {
            sap.m.MessageToast.show("Home clicked!");
        },
        onCRNavPress: function () {
            var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
            oRouter.navTo("CRView");
        }
    });
});