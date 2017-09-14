




var SlideGallery = (function(){
    
    var classNameGallery = 'js-slide-gallery';
    var classNameContent = 'js-slide-content';
    var classNameArrow = 'js-slide-arrow';
    var attributeNameDirection = 'data-slide-direction';
    
    
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
            
            arrow.addEventListener('click', ArrowSlideGallery)
        }
    }
    
    
    
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
    
    
    function ResetGalleryBox(boxElement, show=false)
    {
        boxElement.style.position = '';
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
    
    
    
    function ArrowSlideGallery(clickEvent)
    {
        var arrowElement = clickEvent.currentTarget;
        var direction = arrowElement.getAttribute(attributeNameDirection);
        //var gallery = Utils.GetAncestorByClassName(arrowElement, classNameGallery);
        var gallery = document.getElementsByClassName(classNameGallery)[0];
        
        SlideGallery(gallery, direction);
    }
    
    
    function SlideGallery(gallery, direction)
    {
        var contentBoxes = gallery.getElementsByClassName(classNameContent);
        if(contentBoxes.length <= 1 || SlideInProgress(gallery) ){return}
        
        var currentBox;
        var nextBox;
        
        if(direction == 'left' || direction == -1)
        {
            direction = -1;
        }
        else if(direction == 'right' || direction == 1)
        {
            direction = 1;
        }
        else
        {
            direction = 1;
        }
        
        
        // Get the visable box
        for(let i = 0; i < contentBoxes.length; i++)
        {
            let box = contentBoxes[i];
            
            // is the box visable/not hidden and not in the process of sliding out
            if(box.style.display == '' && box.style.position != 'absolute')
            {
                currentBox = box;
                let nextBoxIndex = Utils.LoopClamp(i+direction, 0, contentBoxes.length-1);
                nextBox = contentBoxes[nextBoxIndex];
                break;
            }
        }
        
        if(currentBox == undefined)
        {
            ResetGallery(gallery);
            return;
        }

        
        // Show this box now in order to get its size and distance properties
        nextBox.style.display = '';
        nextBox.style.zIndex = '-1';
        
        // Remove the current box from the flow
        currentBox.style.position = 'absolute';
        
        
        // Size of the elements (width, height)
        var gallerySize = Utils.Size(gallery);
        var currentBoxSize = Utils.Size(currentBox);
        var nextBoxSize = Utils.Size(nextBox);
        
        // Distance between the box and the gallery
        var currentDistance = Utils.Distance(gallery, currentBox);
        var nextDistance = Utils.Distance(gallery, nextBox);
        
        // How far to move the boxes
        var currentBoxXOffset;
        var nextBoxXOffset;
        
        if(direction == -1)
        {
            currentBoxXOffset = (currentDistance.x + currentBoxSize.x) * -1;
            nextBoxXOffset = Math.abs(gallerySize.x - nextDistance.x);
        }
        else
        {
            currentBoxXOffset = Math.abs(gallerySize.x - currentDistance.x);
            nextBoxXOffset = (nextDistance.x + nextBoxSize.x) * -1;
        }
        currentBoxXOffset += direction; // Extra push to get over floating point inaccuracies
        
        if(currentDistance.x > nextDistance.x)
        {
            Utils.TransitionDuration(currentBox, 0);
            Utils.Translate(currentBox, nextBoxSize.x*-1, 0);  
        }
        
        //setTimeout(PerformSlide, 0);
        PerformSlide();
        function PerformSlide()
        {
            Utils.TransitionDuration(nextBox, 0.001);
            Utils.Translate(nextBox, nextBoxXOffset, 0);
            nextBox.addEventListener('transitionend', FinishSlide);
            
            function FinishSlide()
            {
                Utils.TransitionDuration(nextBox, '');
                Utils.Translate(nextBox, 0,0);
                
                Utils.Translate(currentBox, currentBoxXOffset, 0);
                Utils.TransitionDuration(currentBox, '');
                Utils.OnOutsideParent(currentBox, gallery).then( ()=>{ResetGalleryBox(currentBox); nextBox.style.zIndex=''} );
                nextBox.removeEventListener('transitionend', FinishSlide);
            }
        }
    }
    
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
    * Various utility functions
    */
    var Utils = 
    {
        /**
        * Return the x and y distance between 2 elements.
        * Distance is mesured form the top left corner of the element.
        *
        * @function
        * @return {Vector2} Object with x and y properties as distance
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
        * Return the size of an element inclding padding and borders.
        * @function
        * @return {Vector2} Object with x and y properties as size
        */
        Size: function(element)
        {
            var rect = element.getBoundingClientRect();
            return {x:rect.width, y:rect.height};
        },


        /**
        * Translate an element by setting its inline css property
        * @function
        */
        Translate: function(element, x, y)
        {
            element.style.transform = 'translate(' + x +'px, ' + y +'px)'; 
        },
        
        
        /**
        * Center the transform-origin of an element.
        * Sets it inline CSS property.
        * @function
        */
        CenterOrigin: function(element)
        {
            element.style.transformOrigin = 'center center';
        },


        /**
        * Sets the transition duration inline css property of an element
        * @function
        */
        TransitionDuration: function(element, duration)
        {
            // duration is undefined or an empty string ie(no duration)
            if(duration == false && duration !== 0)
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
        * @function
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
        * Checks weather an element is compleatly outside of another.
        * Does not account for rotation.
        * @function
        */
        IsOutsideParent: function(child, parent)
        {
            var childRect = child.getBoundingClientRect();
            var parentRect = parent.getBoundingClientRect();
            
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
        * Loops a number back to around a maximum and minimum value
        * If it goes over maximum, the minimum is returned and vise-versa.
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


        GetAncestorByClassName: function(element, className)
        {
            if(element.classList.contains(className) )
            {
                return element;
            }
            else if(element.parentElement)
            {
                return Utils.GetAncestorByClassName(element.parentElement, className);
            }
        }
    }
    
    
    
    
    
    
    var module = {Initialize:Initialize, ResetGaller:ResetGallery};
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