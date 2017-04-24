var FormValidator = (function() {
	function FormValidator() {
		this.types = {};
	}

	FormValidator.prototype.validate = function(evt) {
		var elements = evt.srcElement.elements;
		var issues = [];

		for (var i = 0; i < elements.length; i++) {
			var element = elements[i];
			var response = this.validateElement(element);
			if (response) {
				issues.push({
					element: element,
					message: response.message
				});
			}
		}

		if (issues.length && this.issuesCallback) {
			this.issuesCallback(issues);
			evt.preventDefault();
		}
	}

	FormValidator.prototype.attach = function(form) {
		this.form = form;
		this.form.addEventListener("submit", this.validate.bind(this), false);
		this.bindValidationElements(this.form.elements);
		this.resetValidation(form);
	}

	FormValidator.prototype.bindValidationElements = function(elements) {
		for (var i = 0; i < elements.length; i++) {
			this.bindValidationElement(elements[i]);
		}
	}

	FormValidator.prototype.bindValidationElement = function(element) {
		element.addEventListener("keyup", function(evt) {
			this.validateElement(evt.target);
		}.bind(this), false);

		element.addEventListener("change", function(evt) {
			this.validateElement(evt.target);
		}.bind(this), false);
	}

	FormValidator.prototype.resetValidation = function(form) {
		var elements = this.form.elements;
		for (var i = 0; i < elements.length; i++) {
			this.resetElementValidation(elements[i]);
		}
	}

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

	FormValidator.prototype.invalidateElement = function(element, message) {
		if (element.hasAttribute("validation")) {
			var validationField = document.getElementById(element.getAttribute("validation"));
			validationField.innerText = message;
			validationField.classList.remove("validation-hidden");
			element.classList.add("validation-issue");
		}
	}

	FormValidator.prototype.resetElementValidation = function(element) {
		if (element.hasAttribute("validation")) {
			var validationField = document.getElementById(element.getAttribute("validation"));
			validationField.classList.add("validation-hidden");
			element.classList.remove("validation-issue");
		}
	}

	FormValidator.prototype.registerValidator = function(type, callback) {
		this.types[type] = callback;
	}

	FormValidator.prototype.unregisterValidator = function(type) {
		delete this.types[type];
	}

	FormValidator.prototype.hasValidator = function(str, className) {
		var arr = ("" + str).split(" "),len = arr.length,i;
		for (i = 0; i < len; i++)
			if (arr[i] == className) return true;
		return false;
	}

	return FormValidator;
}());