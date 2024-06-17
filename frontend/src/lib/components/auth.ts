import { toast } from "svelte-sonner";
import md5 from "md5";
import sha256 from "sha256";
const pswRegex =
  /^(?=.*[0-9])(?=.*[A-Z])(?=.*[a-z])(?=.*[_!@#$%^&*:;.,?])(?!.*[\\\/<>'"]).{10,}$/;
const usrRegex = /^[a-z0-9_.]{3,24}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function onAuthClick(action:"signup" | "login") {
	// @ts-expect-error
	let pwd = document.querySelector("input[type=\"deblok_pw\"]").value
	// @ts-expect-error
	let usr = document.querySelector("input[type=\"deblok_usr\"]").value
	//console.log(pwd,usr)
	if (pwd.trim() == "" || usr.trim() == "") {
		toast.error("All fields are required.");
		// @ts-expect-error
		document.querySelector('.auth-dialog-trigger').click();
		return
	}
	if (!pswRegex.test(pwd)) {
		toast.error("Password does not meet requirements.", {
			description: "A password must be 10 characters long, have atleast 1 lowercase letter, and atleast 1 number.",
		  });
		// @ts-expect-error
		document.querySelector("input[type=\"deblok_pw\"]").value = ""
		// @ts-expect-error
		document.querySelector('.auth-dialog-trigger').click();
		  return;
	}
	if (!usrRegex.test(pwd)) {
		toast.error("Username does not meet requirements", {
			description: "Your username must be alphabetical (userscores and periods are allowed) and be between 3-24 characters.",
		  });
		// @ts-expect-error
		document.querySelector("input[type=\"deblok_pw\"]").value = ""
		// @ts-expect-error
		document.querySelector('.auth-dialog-trigger').click();
		  return;
	}
	
	usr = "md5:"+md5(usr)
	pwd = "sha256:"+sha256.x2(pwd)
	switch (action) {
		case "signup": {
			// @ts-expect-error
			let email = document.querySelector("input[type=\"deblok_em\"]").value
			break;
		}
		case "login": {
			break;
		}
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
				if (action != "signup" && action != "login") {return}
				await onAuthClick(action);
			};
		}
	}, 500);
};
