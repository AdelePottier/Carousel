class Carousel {
	/**
	 * This callback type is called 'requestCallback' and is displayed as a global symbol
	 *
	 * @callback moveCallback
	 * @param {number} index
	 */

	/**
	 * @param {HTMLElement} element
	 * @param {Object} options
	 * @param {Object} [options.slideToScroll=1] Nombre d'éléments à faire défiler
	 * @param {Object} [options.slidesVisible=1] Nombre d'éléments visible dans le slide
	 * @param {boolean} [options.loop=false]
	 * @param {boolean} [options.infinite=false]
	 * @param {boolean} [option.pagination=false]
	 * @param {boolean} [option.navigationn=true]
	 */

	constructor(element, options = {}) {
		this.element = element;
		this.options = Object.assign(
			{},
			{
				slidesToScroll: 1,
				slidesVisible: 1,
				loop: false,
				pagination: false,
				infinite: false,
				navigation: true,
			},
			options
		);
		if (this.options.loop && this.options.infinite) {
			throw new Error(
				"Le carousel ne peut posséder à la fois les paramètres loop et infinite"
			);
		}
		let children = [].slice.call(element.children);
		this.isMobile = true;
		this.currentItem = 0;
		this.moveCallback = [];
		this.offset = 0;

		//Modif du DOM
		this.root = this.createDivWithClass("carousel");
		this.container = this.createDivWithClass("carousel-container");
		this.root.setAttribute("tabindex", "0");
		this.root.appendChild(this.container);
		this.element.appendChild(this.root);
		this.moveCallBacks = [];
		this.items = children.map((child) => {
			let item = this.createDivWithClass("carousel-item");
			item.appendChild(child);
			this.container.appendChild(item);
			return item;
		});
		if (this.options.infinite) {
			this.offset =
				this.options.slidesVisible + this.options.slidesToScroll;
			if (this.offset > children.length) {
				console.error(
					"il n'y a pas assez d'élément dans le slider",
					element
				);
			}
			this.items = [
				...this.items
					.slice(this.items.length - this.offset)
					.map((item) => item.cloneNode(true)),
				...this.items,
				...this.items
					.slice(0, this.offset)
					.map((item) => item.cloneNode(true)),
			];

			this.goToItem(this.offset, false);
		}
		this.items.forEach((item) => this.container.appendChild(item));

		this.setStyle();
		if (this.options.navigation) {
			this.createNavigation();
		}

		if (this.options.pagination) {
			this.createPagination();
		}

		//Event
		this.moveCallBacks.forEach((cb) => cb(this.currentItem));
		this.onWindowResize();
		window.addEventListener("resize", this.onWindowResize.bind(this));
		this.root.addEventListener("keyup", (e) => {
			if (e.key == "ArrowRight" || e.key === "Right") {
				this.next();
			} else if (e.key == "ArrowLeft" || e.key === "Left") {
				this.prev();
			}
		});
		if (this.options.infinite) {
			this.container.addEventListener(
				"transitionend",
				this.resetInfinite.bind(this)
			);
		}
	}

	/**
	 * Applique les bonne dimensions aux élements du carousel
	 */

	setStyle() {
		let ratio = this.items.length / this.slidesVisible;
		this.container.style.width = ratio * 100 + "%";
		this.items.forEach(
			(item) =>
				(item.style.width = 100 / this.slidesVisible / ratio + "%")
		);
	}

	/**
	 * Crée les flèches de navigation
	 */
	createNavigation() {
		let nextButton = this.createDivWithClass("carousel-next");
		let prevButton = this.createDivWithClass("carousel-prev");
		this.root.appendChild(nextButton);
		this.root.appendChild(prevButton);
		nextButton.addEventListener("click", this.next.bind(this));
		prevButton.addEventListener("click", this.prev.bind(this));
		if (this.options.loop === true) {
			return;
		}
		this.onMove((index) => {
			if (index === 0) {
				prevButton.classList.add("carousel-prev--hidden");
			} else {
				prevButton.classList.remove("carousel-prev--hidden");
			}

			if (
				this.items[this.currentItem + this.slidesVisible] === undefined
			) {
				nextButton.classList.add("carousel-next--hidden");
			} else {
				nextButton.classList.remove("carousel-next--hidden");
			}
		});
	}

	/**
	 * Crée la pagination dans le DOM
	 */
	createPagination() {
		let pagination = this.createDivWithClass("carousel-pagination");
		let buttons = [];
		this.root.appendChild(pagination);
		for (
			let i = 0;
			i < this.items.length - 2 * this.offset;
			i = i + this.options.slidesToScroll
		) {
			let button = this.createDivWithClass("carousel-pagination-button");
			button.addEventListener("click", () =>
				this.goToItem(i + this.offset)
			);
			pagination.appendChild(button);
			buttons.push(button);
		}

		this.onMove((index) => {
			let count = this.items.length - 2 * this.offset;
			let activeButton =
				buttons[
					Math.floor(
						((index - this.offset) % count) /
							this.options.slidesToScroll
					)
				];
			if (activeButton) {
				buttons.forEach((button) =>
					button.classList.remove("carousel-pagination-active")
				);
				activeButton.classList.add("carousel-pagination-active");
			}
		});
	}

	next() {
		/* this.goToItem(this.currentItem + this.options.slidesToScroll); */
		this.goToItem(this.currentItem + this.options.slidesToScroll);
	}

	prev() {
		this.goToItem(this.currentItem - this.options.slidesToScroll);
	}

	/**
	 * Déplace le carousel vers l'élément ciblé
	 * @param {number} index
	 * @param {booleen} [animation=true]
	 */

	goToItem(index, animation = true) {
		if (index < 0) {
			if (this.options.loop) {
				index = this.items.length - this.slidesVisible;
			} else {
				return;
			}
		} else if (
			index >= this.items.length ||
			(this.items[this.currentItem + this.slidesVisible] === undefined &&
				index > this.currentItem)
		) {
			if (this.options.loop) {
				index = 0;
			} else {
				return;
			}
		}
		let translateX = (index * -100) / this.items.length;
		if (animation === false) {
			this.container.style.transition = "none";
		}
		this.container.style.transform =
			"translate3d(" + translateX + "%, 0, 0)";
		this.container.offsetHeight; // force repaint
		if (animation === false) {
			this.container.style.transition = "";
		}
		this.currentItem = index;
		this.moveCallBacks.forEach((cb) => cb(index));
	}

	/**
	 * Déplace le conteneur pour donner l'impression d'un slide infini
	 */
	resetInfinite() {
		if (this.currentItem <= this.options.slidesToScroll) {
			this.goToItem(
				this.currentItem + (this.items.length - 2 * this.offset),
				false
			);
		} else if (this.currentItem >= this.items.length - this.offset) {
			this.goToItem(
				this.currentItem - (this.items.length - 2 * this.offset),
				false
			);
		}
	}

	/**
	 *
	 * @param {moveCallback} cb
	 */
	onMove(cb) {
		this.moveCallBacks.push(cb);
	}

	onWindowResize() {
		let mobile = window.innerWidth < 768;
		if (mobile !== this.isMobile) {
			this.isMobile = mobile;
			this.setStyle();
			this.moveCallBacks.forEach((cb) => cb(this.currentItem));
		}
	}

	/**
	 *
	 * @param {string} className
	 * @returns {HTMLElement}
	 */
	createDivWithClass(className) {
		let div = document.createElement("div");
		div.setAttribute("class", className);
		return div;
	}

	/**
	 * @returns {number}
	 */
	get slidesToScroll() {
		return this.isMobile ? 1 : this.options.slidesToScroll;
	}
	/**
	 * @returns {number}
	 */
	get slidesVisible() {
		return this.isMobile ? 1 : this.options.slidesVisible;
	}
}
