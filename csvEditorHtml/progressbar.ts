
class Progressbar {

	el: HTMLDivElement

	constructor(public id: string) {

	 this.el =	document.getElementById(id) as HTMLDivElement

	 if (!this.el) {
		throw new Error(`could not find element with id ${id}`)
	 }
	}

	setValue(percentage: number) {
		this.el.style.right = `${100-percentage}%`
	}

	show() {
		this.el.style.display = 'block'
	}

	hide() {
		this.el.style.display = 'none'
	}

}