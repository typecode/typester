const input = {
    paragraph: `<p>Lorem ipsum dolor sit amet, iaculis mi scelerisque scelerisque magnis integer, vel eu dui varius. Augue sem venenatis mollis. Sodales laoreet in, justo faucibus tempus est, non vestibulum suscipit ut morbi posuere erat, at id libero metus, hymenaeos consequat eget vel adipiscing. Purus phasellus velit, sed ultrices, lorem suspendisse amet ante amet arcu. Cum sed dolor in risus ipsum ac. Fusce ligula eu donec. Ut justo eget, curabitur a purus, vestibulum eget lacus molestie vitae velit. Urna risus libero lorem hendrerit nulla fermentum, dictum fermentum vitae eros purus semper, sit sem urna vivamus vehicula nulla. Duis ultricies molestie sed, imperdiet integer curabitur orci duis nam dolor, ut erat tortor lacinia elit morbi. Arcu et et lobortis ligula urna, vestibulum in, leo ac elit risus, egestas scelerisque, amet amet in nunc. Convallis ac mauris felis molestie ut, nibh aliquet ridiculus duis. Augue sed nulla orci ullamcorper arcu, phasellus repellendus pede cras lorem ipsum neque, id quis tellus vitae bibendum purus.</p>`,
    line: '<p>Lorem ipsum dolor sit amet, iaculis mi scelerisque</p>'
};

const output = {
    paragraphBold: `<p><b>Lorem ipsum dolor sit amet, iaculis mi scelerisque scelerisque magnis integer, vel eu dui varius. Augue sem venenatis mollis. Sodales laoreet in, justo faucibus tempus est, non vestibulum suscipit ut morbi posuere erat, at id libero metus, hymenaeos consequat eget vel adipiscing. Purus phasellus velit, sed ultrices, lorem suspendisse amet ante amet arcu. Cum sed dolor in risus ipsum ac. Fusce ligula eu donec. Ut justo eget, curabitur a purus, vestibulum eget lacus molestie vitae velit. Urna risus libero lorem hendrerit nulla fermentum, dictum fermentum vitae eros purus semper, sit sem urna vivamus vehicula nulla. Duis ultricies molestie sed, imperdiet integer curabitur orci duis nam dolor, ut erat tortor lacinia elit morbi. Arcu et et lobortis ligula urna, vestibulum in, leo ac elit risus, egestas scelerisque, amet amet in nunc. Convallis ac mauris felis molestie ut, nibh aliquet ridiculus duis. Augue sed nulla orci ullamcorper arcu, phasellus repellendus pede cras lorem ipsum neque, id quis tellus vitae bibendum purus.</b></p>`,
    paragraphItalic: `<p><i>Lorem ipsum dolor sit amet, iaculis mi scelerisque scelerisque magnis integer, vel eu dui varius. Augue sem venenatis mollis. Sodales laoreet in, justo faucibus tempus est, non vestibulum suscipit ut morbi posuere erat, at id libero metus, hymenaeos consequat eget vel adipiscing. Purus phasellus velit, sed ultrices, lorem suspendisse amet ante amet arcu. Cum sed dolor in risus ipsum ac. Fusce ligula eu donec. Ut justo eget, curabitur a purus, vestibulum eget lacus molestie vitae velit. Urna risus libero lorem hendrerit nulla fermentum, dictum fermentum vitae eros purus semper, sit sem urna vivamus vehicula nulla. Duis ultricies molestie sed, imperdiet integer curabitur orci duis nam dolor, ut erat tortor lacinia elit morbi. Arcu et et lobortis ligula urna, vestibulum in, leo ac elit risus, egestas scelerisque, amet amet in nunc. Convallis ac mauris felis molestie ut, nibh aliquet ridiculus duis. Augue sed nulla orci ullamcorper arcu, phasellus repellendus pede cras lorem ipsum neque, id quis tellus vitae bibendum purus.</i></p>`,
    paragraphOrderedList: `<ol><li>Lorem ipsum dolor sit amet, iaculis mi scelerisque scelerisque magnis integer, vel eu dui varius. Augue sem venenatis mollis. Sodales laoreet in, justo faucibus tempus est, non vestibulum suscipit ut morbi posuere erat, at id libero metus, hymenaeos consequat eget vel adipiscing. Purus phasellus velit, sed ultrices, lorem suspendisse amet ante amet arcu. Cum sed dolor in risus ipsum ac. Fusce ligula eu donec. Ut justo eget, curabitur a purus, vestibulum eget lacus molestie vitae velit. Urna risus libero lorem hendrerit nulla fermentum, dictum fermentum vitae eros purus semper, sit sem urna vivamus vehicula nulla. Duis ultricies molestie sed, imperdiet integer curabitur orci duis nam dolor, ut erat tortor lacinia elit morbi. Arcu et et lobortis ligula urna, vestibulum in, leo ac elit risus, egestas scelerisque, amet amet in nunc. Convallis ac mauris felis molestie ut, nibh aliquet ridiculus duis. Augue sed nulla orci ullamcorper arcu, phasellus repellendus pede cras lorem ipsum neque, id quis tellus vitae bibendum purus.</li></ol>`,
    paragraphUnorderedList: `<ul><li>Lorem ipsum dolor sit amet, iaculis mi scelerisque scelerisque magnis integer, vel eu dui varius. Augue sem venenatis mollis. Sodales laoreet in, justo faucibus tempus est, non vestibulum suscipit ut morbi posuere erat, at id libero metus, hymenaeos consequat eget vel adipiscing. Purus phasellus velit, sed ultrices, lorem suspendisse amet ante amet arcu. Cum sed dolor in risus ipsum ac. Fusce ligula eu donec. Ut justo eget, curabitur a purus, vestibulum eget lacus molestie vitae velit. Urna risus libero lorem hendrerit nulla fermentum, dictum fermentum vitae eros purus semper, sit sem urna vivamus vehicula nulla. Duis ultricies molestie sed, imperdiet integer curabitur orci duis nam dolor, ut erat tortor lacinia elit morbi. Arcu et et lobortis ligula urna, vestibulum in, leo ac elit risus, egestas scelerisque, amet amet in nunc. Convallis ac mauris felis molestie ut, nibh aliquet ridiculus duis. Augue sed nulla orci ullamcorper arcu, phasellus repellendus pede cras lorem ipsum neque, id quis tellus vitae bibendum purus.</li></ul>`,
    paragraphBlockquote: `<blockquote>Lorem ipsum dolor sit amet, iaculis mi scelerisque scelerisque magnis integer, vel eu dui varius. Augue sem venenatis mollis. Sodales laoreet in, justo faucibus tempus est, non vestibulum suscipit ut morbi posuere erat, at id libero metus, hymenaeos consequat eget vel adipiscing. Purus phasellus velit, sed ultrices, lorem suspendisse amet ante amet arcu. Cum sed dolor in risus ipsum ac. Fusce ligula eu donec. Ut justo eget, curabitur a purus, vestibulum eget lacus molestie vitae velit. Urna risus libero lorem hendrerit nulla fermentum, dictum fermentum vitae eros purus semper, sit sem urna vivamus vehicula nulla. Duis ultricies molestie sed, imperdiet integer curabitur orci duis nam dolor, ut erat tortor lacinia elit morbi. Arcu et et lobortis ligula urna, vestibulum in, leo ac elit risus, egestas scelerisque, amet amet in nunc. Convallis ac mauris felis molestie ut, nibh aliquet ridiculus duis. Augue sed nulla orci ullamcorper arcu, phasellus repellendus pede cras lorem ipsum neque, id quis tellus vitae bibendum purus.</blockquote>`,
    paragraphPseudo: `<p><span class="typester-pseudo-selection">Lorem ipsum dolor sit amet</span>, iaculis mi scelerisque scelerisque magnis integer, vel eu dui varius. Augue sem venenatis mollis. Sodales laoreet in, justo faucibus tempus est, non vestibulum suscipit ut morbi posuere erat, at id libero metus, hymenaeos consequat eget vel adipiscing. Purus phasellus velit, sed ultrices, lorem suspendisse amet ante amet arcu. Cum sed dolor in risus ipsum ac. Fusce ligula eu donec. Ut justo eget, curabitur a purus, vestibulum eget lacus molestie vitae velit. Urna risus libero lorem hendrerit nulla fermentum, dictum fermentum vitae eros purus semper, sit sem urna vivamus vehicula nulla. Duis ultricies molestie sed, imperdiet integer curabitur orci duis nam dolor, ut erat tortor lacinia elit morbi. Arcu et et lobortis ligula urna, vestibulum in, leo ac elit risus, egestas scelerisque, amet amet in nunc. Convallis ac mauris felis molestie ut, nibh aliquet ridiculus duis. Augue sed nulla orci ullamcorper arcu, phasellus repellendus pede cras lorem ipsum neque, id quis tellus vitae bibendum purus.</p>`,
    paragraphLink1: `<p><a href="http://typecode.com">Lorem ipsum dolor sit amet</a>, iaculis mi scelerisque scelerisque magnis integer, vel eu dui varius. Augue sem venenatis mollis. Sodales laoreet in, justo faucibus tempus est, non vestibulum suscipit ut morbi posuere erat, at id libero metus, hymenaeos consequat eget vel adipiscing. Purus phasellus velit, sed ultrices, lorem suspendisse amet ante amet arcu. Cum sed dolor in risus ipsum ac. Fusce ligula eu donec. Ut justo eget, curabitur a purus, vestibulum eget lacus molestie vitae velit. Urna risus libero lorem hendrerit nulla fermentum, dictum fermentum vitae eros purus semper, sit sem urna vivamus vehicula nulla. Duis ultricies molestie sed, imperdiet integer curabitur orci duis nam dolor, ut erat tortor lacinia elit morbi. Arcu et et lobortis ligula urna, vestibulum in, leo ac elit risus, egestas scelerisque, amet amet in nunc. Convallis ac mauris felis molestie ut, nibh aliquet ridiculus duis. Augue sed nulla orci ullamcorper arcu, phasellus repellendus pede cras lorem ipsum neque, id quis tellus vitae bibendum purus.</p>`,
    paragraphLink2: `<p><a href="/videos/">Lorem ipsum dolor sit amet</a>, iaculis mi scelerisque scelerisque magnis integer, vel eu dui varius. Augue sem venenatis mollis. Sodales laoreet in, justo faucibus tempus est, non vestibulum suscipit ut morbi posuere erat, at id libero metus, hymenaeos consequat eget vel adipiscing. Purus phasellus velit, sed ultrices, lorem suspendisse amet ante amet arcu. Cum sed dolor in risus ipsum ac. Fusce ligula eu donec. Ut justo eget, curabitur a purus, vestibulum eget lacus molestie vitae velit. Urna risus libero lorem hendrerit nulla fermentum, dictum fermentum vitae eros purus semper, sit sem urna vivamus vehicula nulla. Duis ultricies molestie sed, imperdiet integer curabitur orci duis nam dolor, ut erat tortor lacinia elit morbi. Arcu et et lobortis ligula urna, vestibulum in, leo ac elit risus, egestas scelerisque, amet amet in nunc. Convallis ac mauris felis molestie ut, nibh aliquet ridiculus duis. Augue sed nulla orci ullamcorper arcu, phasellus repellendus pede cras lorem ipsum neque, id quis tellus vitae bibendum purus.</p>`,
    lineH1: '<h1>Lorem ipsum dolor sit amet, iaculis mi scelerisque</h1>',
    lineH2: '<h2>Lorem ipsum dolor sit amet, iaculis mi scelerisque</h2>',
    paragraphLineOrderedList: `<p>Lorem ipsum dolor sit amet, iaculis mi scelerisque scelerisque magnis integer, vel eu dui varius. Augue sem venenatis mollis. Sodales laoreet in, justo faucibus tempus est, non vestibulum suscipit ut morbi posuere erat, at id libero metus, hymenaeos consequat eget vel adipiscing. Purus phasellus velit, sed ultrices, lorem suspendisse amet ante amet arcu. Cum sed dolor in risus ipsum ac. Fusce ligula eu donec. Ut justo eget, curabitur a purus, vestibulum eget lacus molestie vitae velit. Urna risus libero lorem hendrerit nulla fermentum, dictum fermentum vitae eros purus semper, sit sem urna vivamus vehicula nulla. Duis ultricies molestie sed, imperdiet integer curabitur orci duis nam dolor, ut erat tortor lacinia elit morbi. Arcu et et lobortis ligula urna, vestibulum in, leo ac elit risus, egestas scelerisque, amet amet in nunc. Convallis ac mauris felis molestie ut, nibh aliquet ridiculus duis. Augue sed nulla orci ullamcorper arcu, phasellus repellendus pede cras lorem ipsum neque, id quis tellus vitae bibendum purus.</p><ol><li>Lorem ipsum dolor sit amet, iaculis mi scelerisque</li></ol>`,
    paragraphLineUnorderedList: `<p>Lorem ipsum dolor sit amet, iaculis mi scelerisque scelerisque magnis integer, vel eu dui varius. Augue sem venenatis mollis. Sodales laoreet in, justo faucibus tempus est, non vestibulum suscipit ut morbi posuere erat, at id libero metus, hymenaeos consequat eget vel adipiscing. Purus phasellus velit, sed ultrices, lorem suspendisse amet ante amet arcu. Cum sed dolor in risus ipsum ac. Fusce ligula eu donec. Ut justo eget, curabitur a purus, vestibulum eget lacus molestie vitae velit. Urna risus libero lorem hendrerit nulla fermentum, dictum fermentum vitae eros purus semper, sit sem urna vivamus vehicula nulla. Duis ultricies molestie sed, imperdiet integer curabitur orci duis nam dolor, ut erat tortor lacinia elit morbi. Arcu et et lobortis ligula urna, vestibulum in, leo ac elit risus, egestas scelerisque, amet amet in nunc. Convallis ac mauris felis molestie ut, nibh aliquet ridiculus duis. Augue sed nulla orci ullamcorper arcu, phasellus repellendus pede cras lorem ipsum neque, id quis tellus vitae bibendum purus.</p><ul><li>Lorem ipsum dolor sit amet, iaculis mi scelerisque</li></ul>`
};

export default { input, output };
