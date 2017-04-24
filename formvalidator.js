/*
	FormValidator - Simple light weight html form validator.
*/
var FormValidator = (function() {
	function FormValidator() {
		this.types = {};
	}
	
	/*
		Validates the form input on submit.
	*/
	FormValidator.prototype.validate = function(evt) {
		var elements = evt.srcElement.elements;
		var issues = [];

		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];
			var response = this.validateElement(element);
			if (response)
				issues.push({element: element, message: response.message});
		}

		if (issues.length && this.issuesCallback) {
			this.issuesCallback(issues);
			evt.preventDefault();
		}
	}

	/*
		Attaches a form to the form validator.
	*/
	FormValidator.prototype.attach = function(form) {
		this.form = form;
		this.form.addEventListener("submit", this.validate.bind(this), false);
		this.bindValidationElements(this.form.elements);
		this.resetValidation(form);
	}

	/*
		Binds the user input control(s) with events to help with real time validation.
	*/
	FormValidator.prototype.bindValidationElements = function(elements) {
		for (var i = 0; i < elements.length; i++) {
			this.bindValidationElement(elements[i]);
		}
	}
	
	/*
		Binds the user input control with events to help with real time validation.
	*/
	FormValidator.prototype.bindValidationElement = function(element) {
		element.addEventListener("keyup", function(evt) {
			this.validateElement(evt.target);
		}.bind(this), false);

		element.addEventListener("change", function(evt) {
			this.validateElement(evt.target);
		}.bind(this), false);
	}

	/*
		Reset all validation elements.
	*/
	FormValidator.prototype.resetValidation = function(form) {
		var elements = this.form.elements;
		for (var i = 0; i < elements.length; i++) {
			this.resetElementValidation(elements[i]);
		}
	}
	
	/*
		Resets the elements validation.
	*/
	FormValidator.prototype.resetElementValidation = function(element) {
		if (element.hasAttribute("validation")) {
			var validationField = document.getElementById(element.getAttribute("validation"));
			validationField.classList.add("validation-hidden");
			element.classList.remove("validation-issue");
		}
	}
	
	/*
		Validates a user input element.
	*/
	FormValidator.prototype.validateElement = function(element) {
		for (var typeKey in this.types) {
			if (this.hasValidator(element.className, typeKey)) {
				var response = this.types[typeKey](element);
				if (element.hasAttribute("validation")) {
					if (!response.success) {
						this.invalidateElement(element, response.message);
						return response;
					}
					this.resetElementValidation(element);
				}
			}
		}
	}
	
	/*
		Invalidate input element as the value it contains is invalid.
	*/
	FormValidator.prototype.invalidateElement = function(element, message) {
		if (element.hasAttribute("validation")) {
			var validationField = document.getElementById(element.getAttribute("validation"));
			validationField.innerText = message;
			validationField.classList.remove("validation-hidden");
			element.classList.add("validation-issue");
		}
	}
	
	/*
		Register new form validator.
	*/
	FormValidator.prototype.registerValidator = function(type, callback) {
		this.types[type] = callback;
	}

	/*
		Unregister form validator.
	*/
	FormValidator.prototype.unregisterValidator = function(type) {
		delete this.types[type];
	}

	/*
		Check to see if input field has validator.
	*/
	FormValidator.prototype.hasValidator = function(str, className) {
		var arr = ("" + str).split(" "),len = arr.length,i;
		for (i = 0; i < len; i++)
			if (arr[i] == className) return true;
		return false;
	}

	return FormValidator;
}());

/*
	Polyfill for classList functions.
	Source: https://gist.github.com/k-gun/c2ea7c49edf7b757fe9561ba37cb19ca
*/
;(function() {
	var regExp = function(name) {
		return new RegExp('(^| )'+ name +'( |$)');
	};

	var forEach = function(list, fn, scope) {
		for (var i = 0; i < list.length; i++) {
			fn.call(scope, list[i]);
		}
	};

	function ClassList(element) {
		this.element = element;
	}

	ClassList.prototype = {
		add: function() {
			forEach(arguments, function(name) {
				if (!this.contains(name)) {
					this.element.className += this.element.className.length > 0 ? ' ' + name : name;
				}
			}, this);
		},
		remove: function() {
			forEach(arguments, function(name) {
				this.element.className = this.element.className.replace(regExp(name), '');
			}, this);
		},
		toggle: function(name) {
			return this.contains(name) ? (this.remove(name), false) : (this.add(name), true);
		},
		contains: function(name) {
			return regExp(name).test(this.element.className);
		},
		replace: function(oldName, newName) {
			this.remove(oldName), this.add(newName);
		}
	};

	if (!('classList' in Element.prototype)) {
		Object.defineProperty(Element.prototype, 'classList', {
			get: function() {
				return new ClassList(this);
			}
		});
	}

	if (window.DOMTokenList && DOMTokenList.prototype.replace == null) {
		DOMTokenList.prototype.replace = ClassList.prototype.replace;
	}
})();