'use strict';

var FormField = require('dw/web/FormField');
var FormGroup = require('dw/web/FormGroup');

/**
 * @description parse FormField element, create context and apply inputfield template to generate form field markup
 * @param {dw.web.FormField} field
 * @param {Object} fieldData extra data that contains context for the template
 * @return {String} HTML markup of the field
 */
function getFieldContext(field, fieldData) {
	var context = {};
	var type;
	switch (field.type) {
		case FormField.FIELD_TYPE_BOOLEAN:
			type = 'checkbox';
			break;
		case FormField.FIELD_TYPE_DATE:
			type = 'date';
			break;
		case FormField.FIELD_TYPE_INTEGER:
		case FormField.FIELD_TYPE_NUMBER:
			type = 'number';
			break;
		case FormField.FIELD_TYPE_STRING:
			type = 'text';
			break;
	}
	context.formfield = field;
	context.type = type;
	if (fieldData) {
		Object.keys(fieldData).forEach(function (prop) {
			context[prop] = fieldData[prop];
		});
	}
	return context;
}

module.exports.getFields = function (formObject, formData) {
	var fields = [];
	for (var formElementName in formObject) {
		var formElement = formObject[formElementName];
		var fieldData;
		if (formData) {
			fieldData = formData[formElementName];
		}
		if (formElement instanceof FormField) {
			if (fieldData && fieldData.skip) {
				continue;
			}
			fields.push(getFieldContext(formElement, fieldData));
		} else if (formElement instanceof FormGroup) {
			if (fieldData && Array.isArray(fieldData)) {
				for (var i = 0; i < fieldData.length; i++) {
					var childField = fieldData[i];
					// in case of nested children, iterate through children selector separated by `.`
					var childFieldElement = formElement;
					var nestedChildren;
					if (childField.fieldName.indexOf('.') !== -1) {
						nestedChildren = childField.fieldName.split('.');
						for (var j = 0; j < nestedChildren.length; j++) {
							childFieldElement = childFieldElement[nestedChildren[j]];
						}
					} else {
						childFieldElement = formElement[childField.fieldName];
					}
					fields.push(getFieldContext(childFieldElement, childField));
				}
			}
		}
	}
	return fields;
};
