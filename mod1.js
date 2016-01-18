



// var name = prompt('What is your name?');
// alert('Hello ' + name);

// for(var i = 0 ; i < 600; i +=100) {
// 	console.log (i);
// }
// for(var i = 0; i < 4;  i++) {
// 	console.log (i,i,i)
// }
// for(var i = 1; i <= 100; i*=2) {
// 	console.log(i)
// }

// var word= prompt('enter any word')
// alert(word+ "\n" +word.length+"\n"+word.charAt(2)+"\n"+word.toLowerCase()+"\n"+word.toUpperCase()+"\n"+"Is "+word+"the word you wanted to use?"+"\n"+word.substring(1,4))


var phone = prompt("Please enter your phone number.", "(xxx-xxx-xxxx)")
if (phone.charAt(3,7) === "-") {
	var dob = prompt('Please enter your date of birth.', '(xx/xx/xx)')
		if(dob.charAt(2,5) === "/") {
			var zip = prompt('now your zipcode.','xxxxx or xxxxx-xxxx')
				if(zip.length === 5 || zip.length === 10){
					var state = prompt('State?','(ex:CO)')
						if(state.length === 2 && state.toUpperCase()) {
							var married = prompt('Are you married?','(yes/no)') 
								if(married.toLowerCase() === 'yes'|| married.toLowerCase() === 'no') {
									alert("Thank you... sucker")
								}
								else {
									alert("invalid answer")
								};
						}
						else {
							alert("invalid answer")
						};

				}
				else {
					alert("invalid answer")
				}
		}
		else {
			alert("invalid answer")
		};
}
else {
	alert("invalid answer")
};










