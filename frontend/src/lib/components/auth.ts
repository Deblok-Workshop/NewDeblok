import { toast } from "svelte-sonner";

let passwordRegex = new RegExp("^(?=.*\\d)(?=.*[a-z])[A-Za-z\\d]{10,}$")

async function onAuthClick() {
	// @ts-expect-error
	let pwd = document.querySelector("input[type=\"password\"]").value
	// @ts-expect-error
	let usr = document.querySelector("input[type=\"username\"]").value
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
				await onAuthClick();
			};
		}
	}, 500);
};
