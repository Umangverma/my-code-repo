import { LightningElement, track, wire } from 'lwc';
import {ShowToastEvent} from 'lightning/platformShowToastEvent';
import setResourceAbsenceFields from '@salesforce/apex/ResourceAbsenceProcessor.setResourceAbsenceFields';
import searchRecord from '@salesforce/apex/CommonUtilities.searchRecord';
import RESOURCEABSENCE_OBJECT from '@salesforce/schema/ResourceAbsence';
import RESOURCE_FIELD from '@salesforce/schema/ResourceAbsence.ResourceId';
import TYPE_FIELD from '@salesforce/schema/ResourceAbsence.Type';
import START_FIELD from '@salesforce/schema/ResourceAbsence.Start';
import END_FIELD from '@salesforce/schema/ResourceAbsence.End';
import APPROVED_FIELD from '@salesforce/schema/ResourceAbsence.FSL__Approved__c';
import DESCRIPTION_FIELD from '@salesforce/schema/ResourceAbsence.Description';
import { getPicklistValues, getObjectInfo } from 'lightning/uiObjectInfoApi';
import { reduceErrors } from 'c/lwcUtility';

export default class NewNA extends LightningElement {
    @track error;
    queryTerm;
    options=[];
    selectedValue;

    @wire(getObjectInfo, { objectApiName: RESOURCEABSENCE_OBJECT })
    handleObjectInfo;
    
    @wire(getPicklistValues,{recordTypeId: '$handleObjectInfo.data.defaultRecordTypeId', fieldApiName: TYPE_FIELD})
    wiredData({error, data}){
        if(data){
            this.options= data.values.map(objPL=>{
                return{
                        label:`${objPL.label}`,
                        value:`${objPL.value}`
                };
            });
            this.options.pop();
        }
        else if (error){
            this.error=error.message;
            this.handleError('Error',reduceErrors(error),'error');
        }
    }

    @track raRecord={
        ResourceId: RESOURCE_FIELD,
        Type: TYPE_FIELD,
        Start: START_FIELD,
        End: END_FIELD,
        FSL__Approved__c: APPROVED_FIELD,
        Description: DESCRIPTION_FIELD
    }
    handleResourceIdChange(event){
        this.raRecord.ResourceId=event.target.value;
    }
    handlePicklistChange(event){
        this.raRecord.Type=event.target.value;
    }
    handleTechnicianStartChange(event){
        this.raRecord.Start = event.target.value;
    }
    handleTechnicianEndChange(event){
        this.raRecord.End=event.target.value;
    }
    handleApprovedChange(event){
        this.raRecord.FSL__Approved__c=event.target.checked;
    }
    handleDescriptionChange(event){
        this.raRecord.Description=event.target.value;
    }
    handleKeyUp(event){
        const isEnterKey = event.keyCode === 13;
        if (isEnterKey) {
            this.queryTerm = event.target.value;
            searchRecord({searchText: this.queryTerm, objectName: 'ServiceResource'})
            .then(result=>{
                this.raRecord.ResourceId=result[0].Id;
                event.target.value = result[0].Name;
            })
            .catch(error=>{
                this.error=error.message;
                this.handleError('Error',reduceErrors(error),'error');
            });
        }
    }
    handleSaveRA(){
        let requiredFieldEmpty=false;
        let mandatoryFields=[];
        this.template.querySelectorAll("lightning-input").forEach(item=>{
            item.reportValidity();
        });
        if (requiredFieldEmpty==false){
            setResourceAbsenceFields({newRA: this.raRecord, isCalledFromLWC: true})
        .then(result=>{
            this.raRecord={};
            this.selectedValue='';
            this.queryTerm='';
            this.resourceStart='';
            this.resourceEnd='';
            this.raRecord.FSL__Approved__c='';
            const toastEvent = new ShowToastEvent({
                title:'Success!',
                message:'Resource Absence created!',
                variant:'success'
            });
            this.dispatchEvent(toastEvent);
        })
        .catch(error=>{
            this.error =error.message;
            this.handleError('Error',reduceErrors(error),'error');
        });
        }
    }
    handleError(title, message, variant){
        let msg='';
        for(var i=0;i<message.length;i++){
            msg +=message[i];
        }
        const toastEvent=new ShowToastEvent({
            title: title,
            message: msg,
            variant: variant,
            mode: 'dismissable'
        });
        this.dispatchEvent(toastEvent);
    }

}