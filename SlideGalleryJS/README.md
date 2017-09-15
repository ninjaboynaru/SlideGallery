
Slide Gallery is a horizontal sliding gallery. 
No client side Javascript setup/initialization required.

Simply
1. Include **slideGaller.js** and **slideGallery.css** in the HTML file
2. Set up the gallery HTML structure
3. The slideGallery.js will automatically initialize itself
4. SlideGallery.js exposes the **SlideGallery** object/module in case you wish to use it


### REQUIREMENTS
- CSS File 'slideGallery.css'

### GALLERY HTML STRUCTURE
The HTML structure of a gallery is composed of
1. The gallery
2. The gallery boxes inside the gallery
3. 2 arrows on each side of the gallery, that when clicked, slide the gallery

```
<some-tag class='js-slide-arrow' data-slide-direction=>
'data-slide-direction=' left or right or -1 or 1 

<div class=''js-slide-gallery''>
 <div 'js-slide-content'>
  (This is known as a gallery/content box)
  ....contents of that slide/box...
 </div>
... repeat the above <div> for each slide
</div>

<some-tag class='js-slide-arrow' data-slide-direction=>
'data-slide-direction=' set to left or right or -1 or 1 
```

### NOTES
- Every gallery box ```(<div class='js-slide-content'>)``` must be the same size.  
  The contents inside may be different sizes but the boxes themselves must be the same size.

- Arrows ```(<some-tag class='js-slide-arrow'>)``` must only border 1 gallery on either side.
	- ```<arrow> <gallery> <arrow>``` : is okay
	- ```<arrow> <gallery> <arrow> <gallery>``` : is bad (second arrow borders 2 galleries)
	- ```<container> <arrow> <gallery> <arrow> </container> <gallery>``` : is okay  
  
- Dynamically creating galleries after **SlideGallery** is initialized will require re-initializing
	- Call ```SlideGallery.Initialize()```
