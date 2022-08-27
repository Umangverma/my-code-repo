({
    doInit: function(component, event, helper) {
        var recordId = component.get('v.recordId');
        var action = component.get('c.getRecordDetailsFromId');
        action.setParams({
            'recId': recordId
        });
        helper.showSpinner(component);
        action.setCallback(this, function(response){
            var state = response.getState();
            helper.hideSpinner(component);
            if(state === 'SUCCESS'){
                var data = response.getReturnValue();
                component.set('v.defaults', data.defaults);
                component.set('v.editSection', data.editFields);
                component.set('v.readSection', data.readFields);
            } else if(state === 'ERROR'){
                var errors = response.getError();
                if(errors){
                    if(errors[0] && errors[0].message){
                        console.log("Error: " + errors[0].message);
                    } else if (errors.message) {
                        console.log("Error: " + errors.message);
                    }
                } else {
                    console.log("Something went wrong.");
                }
            }
        });
        $A.enqueueAction(action);
    },
    handleOnSubmit: function(component, event, helper) {
        helper.showSpinner(component);
        // you can set some default fields here as well
        // let's you have some fields which you don't want to 
        // show on the form but still want to set default values
    },
    handleOnSuccess: function(component, event, helper) {
        helper.hideSpinner(component);
        var record = event.getParam("response");
        component.find("notificationsLibrary").showToast({
            "title": "Success",
            "variant": "success",
            "message": "Quote {0} created.",
            "messageData": [
                {
                    url: '/' + record.id,
                    label: record.fields.Name.value
                }
            ]
        });
        var navEvent = $A.get("e.force:navigateToSObject");
        navEvent.setParams({
            "recordId": record.id,
            "slideDevName": "related"
        });
        navEvent.fire();
    },
    handleOnError: function(component, event, helper) {
        helper.hideSpinner(component);
        var err = event.getParam('error');
        component.find("notificationsLibrary").showToast({
            "title": "Error",
            "variant": "error",
            "message": err.body ? err.body.message : (err.data ? err.data.message : 'Something went wrong.')
        });
    }
})