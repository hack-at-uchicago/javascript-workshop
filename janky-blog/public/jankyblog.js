document.addEventListener('DOMContentLoaded', function() {
	var like_buttons = document.querySelectorAll('a.like-button');
	for(var i=0; i < like_buttons.length; i++) {
		var like_button = like_buttons[i];
		install_like_handler(like_button);
	}
});

function install_like_handler(like_button) {
	var post_id = like_button.dataset.postId;
	like_button.addEventListener('click', function() {
		var command;
		if(like_button.innerText == 'Like') {
			command = 'like';
		} else {
			command = 'unlike';
		}
		// AJAX magic!
		var req = new XMLHttpRequest();
		req.open('get', '/' + command + '/' + post_id, true); // e.g. /like/2
		req.addEventListener('load', function() {
			update_like_number(like_button)
		});
		req.send();
	});
}

function update_like_number(like_button) {
	var liking = like_button.innerText == 'Like';
	if(liking) {
		like_button.innerText = 'Unlike';
	} else {
		like_button.innerText = 'Like';
	}
	var parent = like_button.parentElement;
	var counter_element = parent.querySelector('.likes-counter');
	var num_people = parseInt(counter_element.innerText);
	if(liking) {
		counter_element.innerText = (num_people + 1).toString();
	} else {
		counter_element.innerText = (num_people - 1).toString();
	}
}