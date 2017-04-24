# FormValidator
Automatically validate html forms without the need of importing other external dependencies.

<h1>Setup</h1>
<h2>Create the input controls and validation fields. Link validation field to the input via the validation attribute.</h2>
<div>
User<br/>
<input type="text" validation="validation1" validate-on="sixormore"/>
<div class="validation" id="validation1"></div><br/>
</div>
