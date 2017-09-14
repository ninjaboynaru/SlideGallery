

/**
* Slide Gallery Control Module
* Facilitates horizontal scrolling of images in a gallery.
*
* @module
*/
var SlideGallery = (function(){
    
    // Names of the CSS classes used by the code
    var classNameGallery = 'js-slide-gallery';
    var classNameContent = 'js-slide-content';
    var classNameArrow = 'js-slide-arrow';
    var attributeNameDirection = 'data-slide-direction';
    
    /**
    * Object that maps left and right directions to numbers 1 and -1
    * @private
    */
    var directionMap = {left:-1, right:1, '-1':-1, '1':1};
    
    
    /**
    * Initialize the galleries.
    * Sets the initial state of the galleries in the page and attaches
    * event handlers to arrows.
    *
    * @function
    */
    function Initialize()
    {
        var galleries = document.getElementsByClassName(classNameGallery);
        var arrows = document.getElementsByClassName(classNameArrow);
        
        for(let i = 0; i < galleries.length; i++)
        {
            let gallery = galleries[i];
            ResetGallery(gallery);
        }
        for(let i = 0; i < arrows.length; i++)
        {
            let arrow = arrows[i];
            let direction = arrow.getAttribute(attributeNameDirection);
            
            arrow.addEventListener('click', ArrowClickedHandler)
        }
    }
    
    
    /**
    * Resets a gallery to its initial position.
    * All boxes in the gallery are hidden except the first one.
    *
    * @function
    * @param {Node} gallery - Gallery HTML element to be reset 
    */
    function ResetGallery(gallery)
    {
        var contentBoxes = gallery.getElementsByClassName(classNameContent);
        for(let i = 0; i < contentBoxes.length; i++)
        {
            let contentBox = contentBoxes[i];
            
            if(i == 0)
            {
                ResetGalleryBox(contentBox, true);
            }
            else
            {
                ResetGalleryBox(contentBox, false);
            }
        }
    }
    
    
    /**
    * Resets some inline CSS properties of a gallery box.
    * Allows those properties to be dictated by the elements stylesheet properties
    *
    * @function
    * @private
    * @param {Node} boxElement - The box to be reset
    * @param {Node} show=false - Weather or not to show the box with the CSS display property
    */
    function ResetGalleryBox(boxElement, show=false)
    {
        boxElement.style.position = '';
        Utils.TransitionDuration(boxElement, '');
        Utils.Translate(boxElement, 0, 0);
        
        if(show)
        {
            boxElement.style.display = '';
        }
        else
        {
            boxElement.style.display = 'none';
        }
    }
    
    /**
    * Checks if a gallery is performing a slide
    *
    * A galleryBox whose position is absolute is sliding, thus
    * its parent gallery is in the middle of performing a slide.
    *
    * @function
    * @private
    * @param {Node} gallery - the gallery to check
    */
    function SlideInProgress(gallery)
    {
        var contentBoxes = gallery.getElementsByClassName(classNameContent);
        for(let i = 0; i < contentBoxes.length; i++)
        {
            if(contentBoxes[i].style.position == 'absolute')
            {
                return true;
            }
        }
        
        return false;
    }
    
    
    /**
    * Get the boxes of a gallery that would be slid if the gallery were slided
    * Those boxes are the currently active/shown box, and the one in front or behind of it
    *
    * @function
    * @private
    * @param {Node} gallery
    * @param {number} direction - The direction of the slide
    *
    * @returns {Object} importantBoxes - Object containg the boxes
    * @returns {Node} importantBoxes.activeBox -  The currently active box
    * @returns {Node} importantBoxes.nextBox - The box after or before the currently active box (depends on direction) 
    */
    function ImportantBoxes(gallery, direction)
    {
        var contentBoxes = gallery.getElementsByClassName(classNameContent);
        var activeBox;
        var nextBox;
        
        // Get the visable box
        for(let i = 0; i < contentBoxes.length; i++)
        {
            let box = contentBoxes[i];
            
            // is the box visable and not in the process of sliding out
            if(box.style.display == '' && box.style.position != 'absolute')
            {
                activeBox = box;
                
                // loop back around if i goes below 0 or over the length of the array
                let nextBoxIndex = Utils.LoopClamp(i+direction, 0, contentBoxes.length-1);
                nextBox = contentBoxes[nextBoxIndex];
                break;
            }
        }
        
        var importantBoxes = {activeBox:activeBox, nextBox:nextBox};
        return importantBoxes;
    }
    
    
    /**
    * Returns if a gallery is ready to be slid or not
    *
    * If the gallery is not currently sliding and it has more than 1 box than it is ready
    *
    * @function
    * @private
    * @param {Node} gallery
    * @returns {boolean} If the gallery is ready to be slid
    */
    function GalleryReady(gallery)
    {
        var contentBoxes = gallery.getElementsByClassName(classNameContent);
        if(contentBoxes.length <= 1 || SlideInProgress(gallery) )
        {
            return false;
        }
        return true;
    }
    
    
    /**
    * Callback function for clicking a gallery arrow
    *
    * Will extract the direction attribute from the arrow and then slide the gallery
    * that the arrow belongs to
    *
    * @function
    * @private
    * @param{MouseEvent} clickEvent - The MouseEvent resulting from clicking the arrow
    */
    function ArrowClickedHandler(clickEvent)
    {
        var arrowElement = clickEvent.currentTarget;
        var direction = arrowElement.getAttribute(attributeNameDirection);
        var gallery = GalleryOfArrow(arrowElement);
        
        direction = directionMap[direction]; // Change direction into a number
        direction = direction || 1; // in case of invalid direction
        
        SlideGallery(gallery, direction);
    }
    
    
    /**
    * Returns the gallery that an arrow belongs to
    * Returns undefined if one can not be found
    *
    * Checks if each ancestor of the arrow contains the CSS class of a gallery.
    * If not then checks if the elements to the right and to the left of that ancestor (siblings) contain the
    * CSS class of a gallery.
    *
    * @function
    * @private
    *
    * @param {Node} arrowElement - The arrow element to get a gallery for
    * @returns {Node} The gallery that the arrow belongs to
    */
    function GalleryOfArrow(arrowElement)
    {
        let ancestorsOfArrow = Utils.AncestorGenerator(arrowElement);
        for(let ancestor of ancestorsOfArrow)
        {
            if(ancestor.classList.contains(classNameGallery) )
            {
                return ancestor;
            }
            else if(ancestor.nextElementSibling && ancestor.nextElementSibling.classList.contains(classNameGallery) )
            {
                return ancestor.nextElementSibling;
            }
            else if(ancestor.previousElementSibling && ancestor.previousElementSibling.classList.contains(classNameGallery) )
            {
                return ancestor.previousElementSibling;
            }
        }
    }
    
    
    
    
    /**
    * Slides the boxes of a gallery in a direction (left or right, -1 or 1)
    *
    * This function should not be called directly by the client.
    * Instead, the Initialize() function should be called wich will attach event handlers
    * to all arrow elements belonging to a gallery. Those event handlers will call this method.
    *
    * @function
    * @private
    * @param {Node} gallery - The gallery to slide
    * @param {Number} direction -  The direction to slide the gallery (-1 or 1)
    */
    function SlideGallery(gallery, direction)
    {
        if(GalleryReady(gallery) == false){return}
        
        var importantBoxes = ImportantBoxes(gallery, direction);  //The boxes to slide/move
        var activeBox = importantBoxes.activeBox; // The currently active box
        var nextBox = importantBoxes.nextBox; // The box after(or before) the active box

        
        // Physicaly show nextBox to get its distance properties
        nextBox.style.display = '';
        
        // "Visualy" hide nextBox so it dosen't flash on screen
        nextBox.style.visibility = 'hidden';
        
        
        // Remove the active box from the flow
        activeBox.style.position = 'absolute';
        
        
        var gallerySize = Utils.Size(gallery);
        var boxSize = Utils.Size(activeBox);
        
        // Distance between the boxes and the gallery
        var activeBoxDistance = Utils.Distance(gallery, activeBox);
        var nextBoxDistance = Utils.Distance(gallery, nextBox);
        
        
        // How far to move the boxes
        var activeBoxOffset;
        var nextBoxOffset;
        
        
        /*
        * PROCESS EXPLINATION
        *
        * The nextBox is first to be moved just outside of the gallery, in the oposite direction.
        * The activeBox is then to be moved just outside of the gallery in the correct direction.
        *
        * While the activeBox is moving outside of
        * the gallery, the nextBox is to be moved inside of the gallery, to its default position (default is x=0, y=0).
        * (Thus while the activeBox slides out, the nextBox slides in)
        *
        * Movement is done by setting the CSS transform translate property of the boxes
        * Sliding is achived using the CSS transition duration property
        *
        * Instant movements are done by temporarly setting the transition duration property to 0
        */
        
        if(direction == -1)
        {
            activeBoxOffset = (activeBoxDistance.x + boxSize.x) * -1;
            nextBoxOffset = Math.abs(gallerySize.x - nextBoxDistance.x);
        }
        else
        {
            activeBoxOffset = Math.abs(gallerySize.x - activeBoxDistance.x);
            nextBoxOffset = (nextBoxDistance.x + boxSize.x) * -1;
        }
		
		// Extra push to get over floating point inaccuracies (position of activeBox will be later compared)
        activeBoxOffset += direction;
        
        
        /* If nextBox is behind activeBox, move activeBox to compensate for activeBox
		getting pushed over due to nextBox beaing in the layout/visable */
        if(activeBoxDistance.x > nextBoxDistance.x)
        {
            Utils.TransitionDuration(activeBox, 0);
            Utils.Translate(activeBox, boxSize.x*-1, 0);  
        }
        
        PerformSlide();
        function PerformSlide()
        {
            // Instantly move nextBox, to just outside the gallery
            Utils.TransitionDuration(nextBox, 0.001);
            Utils.Translate(nextBox, nextBoxOffset, 0);
			
			// Finish the rest of the slide only when nextBox has exited the gallery
            nextBox.addEventListener('transitionend', FinishSlide);
            
            function FinishSlide()
            {
                // Move nextBox into the gallery and "Visauly" show it
                nextBox.style.visibility='';
                Utils.TransitionDuration(nextBox, '');
                Utils.Translate(nextBox, 0,0);
                
                // Move activeBox out of the gallery
                Utils.Translate(activeBox, activeBoxOffset, 0);
                Utils.TransitionDuration(activeBox, '');
				
				// Reset activeBox when it has exited the gallery
                Utils.OnOutsideParent(activeBox, gallery).then( ()=>{ResetGalleryBox(activeBox) } );
                nextBox.removeEventListener('transitionend', FinishSlide);
            }
        }
    }
    
    
    /**
    * Various utility functions
    */
    var Utils = 
    {
        /**
        * Return the x and y distance between 2 elements.
        * Distance is measured form the top left corner of the element.
        *
        * @function
        * @returns {Object} Object with x and y properties as distance
        */
        Distance: function(element1, element2)
        {
            var e1Rect = element1.getBoundingClientRect();
            var e2Rect = element2.getBoundingClientRect();

            var xDistance = e1Rect.left - e2Rect.left;
            var yDistance = e1Rect.top - e2Rect.top;

            xDistance = Math.abs(xDistance);
            yDistance = Math.abs(yDistance);

            return {x:xDistance, y:yDistance};
        },


        /**
        * Return the size of an element including padding and borders.
        * @function
        * @returns {Object} Object with x and y properties as size
        */
        Size: function(element)
        {
            var rect = element.getBoundingClientRect();
            return {x:rect.width, y:rect.height};
        },


        /**
        * Translate an element by setting its inline css property
		* Sets the elements inline CSS
		*
        * @function
		* @param {number} x=0 - X Translation
		* @param {number} y=0 - Y Translation
        */
        Translate: function(element, x=0, y=0)
        {
            element.style.transform = 'translate(' + x +'px, ' + y +'px)'; 
        },

        /**
        * Sets the transition duration of an element
		* Sets the elements inline CSS
		*
        * @function
		* @param {number=} duration - The duration of the elements transitions. 
		* An undefined or empty string results in the inline transitionDuration property being removed
        */
        TransitionDuration: function(element, duration)
        {
			// No transition duration
            if(duration == undefined || (duration == false && duration !== 0) )
            {
                element.style.transitionDuration = '';
            }
            else
            {
                element.style.transitionDuration = duration + 's';
            }
        },


        /**
        * Returns a promise that resolves when a child element exits its parent.
        * The promise will never reject.
		*
        * @function
		* @returns {Promise}
        */
        OnOutsideParent: function(child, parent)
        {
            return new Promise(OutsideBoundsPromise);
            function OutsideBoundsPromise(resolve, reject)
            {
                var checkDelay = 100; //check every 200ms
                var timerID;
                
                timerID = setInterval(function()
                {                    
                    if(Utils.IsOutsideParent(child, parent) )
                    {
                        clearInterval(timerID);
                        resolve(true);
                    }
                }, checkDelay);
                
            }
        },
        
        
        /**
        * Checks weather an element is completely outside of another.
        * Does not account for rotation.
        * @function
        */
        IsOutsideParent: function(child, parent)
        {
            var childRect = child.getBoundingClientRect();
            var parentRect = parent.getBoundingClientRect();
            
			/* Checks if the edges of one element are
			in a position (global page wide position) greater or less than the edges of the other */
			
            if( (childRect.right <= parentRect.left) || (childRect.left >= parentRect.right) )
            {
                return true;
            }
            else if( (childRect.btttom <= parentRect.top) || (childRect.top >= parentRect.bottom) )
            {
                return true;
            }
            return false;
        },


        /**
        * Loops a number around a maximum and minimum value
        * If it goes over the maximum, the minimum is returned and vise-versa.
        *
        * @function
        * @param {int} value - The value to restrict
        * @param {int} minimum - minimum value (inclusive)
        * @param {int} maximum - maximum value (inclusive)
        */
        LoopClamp: function(value, minimum, maximum)
        {
            if(value > maximum){ return minimum }
            else if(value < minimum){ return maximum }
            else{ return value }
        },


		/**
		* Generator that literates over all the ancestors of an element
		* @generator
		*/
        AncestorGenerator: function*(element)
        {
            yield element;
            while(element.parentElement)
            {
                element = element.parentElement;
                yield element;
            }
        }
    }
    
    
    
    
    
    
    var module = {Initialize:Initialize, ResetGallery:ResetGallery};
    return module;
})();







;(function(){
    var documentReady = new Promise(function(resolve, reject){
        var docReady = !(document.readyState != 'complete' && document.readyState != 'interactive');

        if(docReady == false)
        {
            document.addEventListener('DOMContentLoaded', resolve);
        }
        else
        {
            resolve();
        }
    });
    
    documentReady.then(SlideGallery.Initialize)
})();