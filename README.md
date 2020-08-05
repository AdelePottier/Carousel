# Carousel

Pour insérer le carousel

```
let onReady = function () {
		new Carousel(document.querySelector("#carousel1"), {
			{options...]
		});
	};

	if (document.readyState !== "loading") {
		onReady();
	}
	document.addEventListener("DOMContentLoaded", onReady);
```

Les options disponibles:

```
//Le nombre d'éléments à faire defiler:
slidesVisible{number}: 1,

// Le nombre d'éléments visibles dans le slide
slideToScroll{number}: 1,

//autres options:
infinite {booleen}: false;
loop {booleen}: false;
loop {booleen}: false;
pagination {booleen}: false;

```

HTML:

```
<div class="item">
	<div class="item-image">
		<img src="./img/apple-5391076_1920.jpg" alt="img1" />
	</div>
	<div class="item-body">
		<div class="item-title">Mon titre 1</div>
		<div class="item-description">
		    <em>Petite description</em>
	    </div>
    </div>
</div>

```
