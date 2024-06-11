import { toast } from "svelte-sonner";
import md5 from "md5";
import sha256 from "sha256";
let passwordRegex = new RegExp("^(?=.*[a-z])(?=.*\\d).{10,}$")

async function onAuthClick(action:"signup" | "login") {
	// @ts-expect-error
	let pwd = document.querySelector("input[type=\"password\"]").value
	// @ts-expect-error
	let usr = document.querySelector("input[type=\"username\"]").value
	//console.log(pwd,usr)
	if (pwd.trim() == "" || usr.trim() == "") {
		toast.error("All fields are required.");
		// @ts-expect-error
		document.querySelector('.auth-dialog-trigger').click();
		return
	}
	if (!passwordRegex.test(pwd)) {
		toast.error("Password does not meet requirements.", {
			description: "A password must be 10 characters long, have atleast 1 lowercase letter, and atleast 1 number.",
		  });
		// @ts-expect-error
		document.querySelector("input[type=\"password\"]").value = ""
		// @ts-expect-error
		document.querySelector('.auth-dialog-trigger').click();
		  return;
	}
	usr = "md5:"+md5(usr)
	pwd = "sha256:"+sha256.x2(pwd)
	switch (action) {
		case "signup": {break;}
		case "login": {break;}
	}
}

export default async () => {
	setInterval(() => {
		if (!document.querySelector('[role="alertdialog"]')) {
			// @ts-expect-error
			document.querySelector('.auth-dialog-trigger').click();
		} else {
			// @ts-expect-error
			document.querySelector('.authtrigger').onclick = async (e: any) => {
				e.preventDefault();
				let action = document.location.pathname.slice(1)
				if (action != "signup" && action != "login") {return;}
				await onAuthClick(action);
			};
		}
	}, 500);
};
