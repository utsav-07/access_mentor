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
                    "PURCHASE": {
                        query: "PURCHASE",
                        tcodes: [
                            {
                                code: "ME21N",

                            },
                            {
                                code: "ME51N",
                                roles: [
                                    {
                                        name: "Z1_BC_SAP_REQ_CRT",
                                        sod: "",
                                        roleTcodes: ["ME52N", "ME53N"]
                                    }
                                ]
                            },
                            {
                                code: "ME23N",
                                roles: [
                                    {
                                        name: "Z1_BC_SAP_PUR_DISP",
                                        sod: "",
                                        roleTcodes: ["ME21N"]
                                    }
                                ]
                            },
                            {
                                code: "ME22N",
                                roles: [
                                    {
                                        name: "Z1_BC_SAP_PUR_EDIT",
                                        sod: "EDIT CONFLICT",
                                        roleTcodes: ["ME21N", "ME23N"]
                                    }
                                ]
                            },
                            {
                                code: "ME31K",
                                roles: [
                                    {
                                        name: "Z1_BC_SAP_CONTRACT_CRT",
                                        sod: "",
                                        roleTcodes: ["ME32K", "ME33K"]
                                    }
                                ]
                            },
                            {
                                code: "ME4100000000000000000000000000000000",
                                roles: [
                                    {
                                        name: "Z1_BC_SAP_RFQ_CRT",
                                        sod: "RFQ SOD",
                                        roleTcodes: ["ME42", "ME43"]
                                    }
                                ]
                            },
                            {
                                code: "ME51",
                                roles: [
                                    {
                                        name: "Z1_BC_SAP_REQ_MANUAL",
                                        sod: "",
                                        roleTcodes: ["ME52", "ME53"]
                                    }
                                ]
                            },
                            {
                                code: "ME11",
                                roles: [
                                    {
                                        name: "Z1_BC_SAP_INFO_REC_CRT",
                                        sod: "",
                                        roleTcodes: ["ME12", "ME13"]
                                    }
                                ]
                            },
                            {
                                code: "ME61",
                                roles: [
                                    {
                                        name: "Z1_BC_SAP_VENDOR_EVAL",
                                        sod: "EVALUATION CONFLICT",
                                        roleTcodes: ["ME62"]
                                    }
                                ]
                            },
                            {
                                code: "ME91E",
                                roles: [
                                    {
                                        name: "Z1_BC_SAP_REMIND_PO",
                                        sod: "",
                                        roleTcodes: ["ME9E"]
                                    }
                                ]
                            },
                            {
                                code: "ME91E",
                                roles: [
                                    {
                                        name: "Z1_BC_SAP_REMIND_PO",
                                        sod: "",
                                        roleTcodes: ["ME9E"]
                                    }
                                ]
                            },
                            {
                                code: "ME91E",
                                roles: [
                                    {
                                        name: "Z1_BC_SAP_REMIND_PO",
                                        sod: "",
                                        roleTcodes: ["ME9E"]
                                    }
                                ]
                            },
                            {
                                code: "ME91E",
                                roles: [
                                    {
                                        name: "Z1_BC_SAP_REMIND_PO",
                                        sod: "",
                                        roleTcodes: ["ME9E"]
                                    }
                                ]
                            },
                            {
                                code: "ME91E",
                                roles: [
                                    {
                                        name: "Z1_BC_SAP_REMIND_PO",
                                        sod: "",
                                        roleTcodes: ["ME9E"]
                                    }
                                ]
                            }
                        ]
                    },
                    "INVOICE": {
                        query: "INVOICE",
                        tcodes: [
                            {
                                code: "MIRO",
                                roles: [
                                    {
                                        name: "Z1_BC_SAP_INV_POST",
                                        sod: "INVOICE SOD CONFLICT",
                                        roleTcodes: ["MIR4", "MIR6"]
                                    }
                                ]
                            }
                        ]
                    },
                    "GRN": {
                        query: "GRN",
                        tcodes: [
                            {
                                code: "MM01",
                                roles: [
                                    {
                                        name: "Z1_BC_SAP_GRN_DIS",
                                        sod: "SOD ANALYSIS",
                                        roleTcodes: ["PFCG"]
                                    }
                                ]
                            },
                            {
                                code: "MM02",
                                roles: [
                                    {
                                        name: "Z1_BC_SAP_GRN_CRT",
                                        sod: "",
                                        roleTcodes: ["SU53"]
                                    }
                                ]
                            }
                        ]
                    }
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
                sodTableData: [
                    {
                        userId: "U123450",
                        accessRiskId: "AR001",
                        system: "SAPPRD",
                        ruleId: "R1001",
                        riskLevel: "High",
                        action: "Approve",
                        lastExecutedOn: "2024-06-01",
                        executionCount: "5",
                        control: "Yes",
                        monitor: "No",
                        orgRuleId: "ORG001"
                    },
                    {
                        userId: "U123450",
                        accessRiskId: "AR001",
                        system: "SAPPRD",
                        ruleId: "R1001",
                        riskLevel: "High",
                        action: "Approve",
                        lastExecutedOn: "2024-06-01",
                        executionCount: "5",
                        control: "Yes",
                        monitor: "No",
                        orgRuleId: "ORG001"
                    },
                    {
                        userId: "U123450",
                        accessRiskId: "AR001",
                        system: "SAPPRD",
                        ruleId: "R1001",
                        riskLevel: "High",
                        action: "Approve",
                        lastExecutedOn: "2024-06-01",
                        executionCount: "5",
                        control: "Yes",
                        monitor: "No",
                        orgRuleId: "ORG001"
                    },
                    {
                        userId: "U123450",
                        accessRiskId: "AR001",
                        system: "SAPPRD",
                        ruleId: "R1001",
                        riskLevel: "High",
                        action: "Approve",
                        lastExecutedOn: "2024-06-01",
                        executionCount: "5",
                        control: "Yes",
                        monitor: "No",
                        orgRuleId: "ORG001"
                    },
                    {
                        userId: "U123450",
                        accessRiskId: "AR001",
                        system: "SAPPRD",
                        ruleId: "R1001",
                        riskLevel: "High",
                        action: "Approve",
                        lastExecutedOn: "2024-06-01",
                        executionCount: "5",
                        control: "Yes",
                        monitor: "No",
                        orgRuleId: "ORG001"
                    },
                    {
                        userId: "U123450",
                        accessRiskId: "AR001",
                        system: "SAPPRD",
                        ruleId: "R1001",
                        riskLevel: "High",
                        action: "Approve",
                        lastExecutedOn: "2024-06-01",
                        executionCount: "5",
                        control: "Yes",
                        monitor: "No",
                        orgRuleId: "ORG001"
                    },
                    {
                        userId: "U123450",
                        accessRiskId: "AR001",
                        system: "SAPPRD",
                        ruleId: "R1001",
                        riskLevel: "High",
                        action: "Approve",
                        lastExecutedOn: "2024-06-01",
                        executionCount: "5",
                        control: "Yes",
                        monitor: "No",
                        orgRuleId: "ORG001"
                    },
                    {
                        userId: "U123450",
                        accessRiskId: "AR001",
                        system: "SAPPRD",
                        ruleId: "R1001",
                        riskLevel: "High",
                        action: "Approve",
                        lastExecutedOn: "2024-06-01",
                        executionCount: "5",
                        control: "Yes",
                        monitor: "No",
                        orgRuleId: "ORG001"
                    },
                    {
                        userId: "U123450",
                        accessRiskId: "AR001",
                        system: "SAPPRD",
                        ruleId: "R1001",
                        riskLevel: "High",
                        action: "Approve",
                        lastExecutedOn: "2024-06-01",
                        executionCount: "5",
                        control: "Yes",
                        monitor: "No",
                        orgRuleId: "ORG001"
                    },
                    {
                        userId: "U123450",
                        accessRiskId: "AR001",
                        system: "SAPPRD",
                        ruleId: "R1001",
                        riskLevel: "High",
                        action: "Approve",
                        lastExecutedOn: "2024-06-01",
                        executionCount: "5",
                        control: "Yes",
                        monitor: "No",
                        orgRuleId: "ORG001"
                    },
                    {
                        userId: "U123450",
                        accessRiskId: "AR001",
                        system: "SAPPRD",
                        ruleId: "R1001",
                        riskLevel: "High",
                        action: "Approve",
                        lastExecutedOn: "2024-06-01",
                        executionCount: "5",
                        control: "Yes",
                        monitor: "No",
                        orgRuleId: "ORG001"
                    },
                    {
                        userId: "U67890",
                        accessRiskId: "AR002",
                        system: "SAPDEV",
                        ruleId: "R1002",
                        riskLevel: "Medium",
                        action: "Review",
                        lastExecutedOn: "2024-05-28",
                        executionCount: "2",
                        control: "No",
                        monitor: "Yes",
                        orgRuleId: "ORG002"
                    }
                ],
                showSODTable: false,
                tcodeBusy: false,
                roleBusy: false,
                infoCenterBusy: false,
                sodBusy: false,
                showStandardRoles: true,
                showNonStandardRoles: true
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
            if (sText === "Own") {
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
            const sUser = "UUU927917"; // Use fixed or dynamic user

            // Show loading indicator
            oModel.setProperty("/roleBusy", true);
            oVBox.addStyleClass("busyTop");

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
        _validateTcodesWithOData: async function(aTcodes) {
            const oODataModel = this.getOwnerComponent().getModel();
            if (!aTcodes || aTcodes.length === 0) return [];
            // Build filter string for all T-codes
            const tcodeFilters = aTcodes.map(tc => `Tcode eq '${tc.code}'`).join(' or ');
            return new Promise((resolve) => {
                oODataModel.read("/all_tcodeSet", {
                    urlParameters: { "$filter": tcodeFilters },
                    success: function(data) {
                        // data.results: [{ Tcode, TcodeDesc }]
                        const validTcodes = data.results.map(item => ({
                            code: item.Tcode,
                            description: item.RoleDesc ? item.RoleDesc : 'No description available'
                        }));
                        resolve(validTcodes);
                    },
                    error: function() {
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
                    // Only add if exists in backend
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
            const apiKey = "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"; // 🔐 Replace with your actual OpenAI API key
            const prompt = `You are an SAP expert. List SAP T-Codes with their descriptions needed for the task: "${queryText}". Return the result as valid JSON array like:
        [
          { "code": "ME21N", "description": "Create Purchase Order" },
          { "code": "ME23N", "description": "Display Purchase Order" }
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

                const match = content.match(/\[\s*{[^]*}\s*\]/);
                if (match) {
                    return JSON.parse(match[0]); // Return extracted JSON array
                } else {
                    console.warn("OpenAI response format unrecognized:", content);
                    return [];
                }

            } catch (error) {
                console.error("OpenAI API error:", error);
                return [];
            }
        },

        onSendSODPress: function () {
            var oModel = this.getView().getModel();
            oModel.setProperty("/showSODTable", true);
        },

        onApplyPress: function () {
            // Handle Apply button press
            console.log("Apply button pressed");
            // Add your logic here
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
                var isStandard = roleName.toUpperCase().startsWith("SAP");
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
        }

    });
});