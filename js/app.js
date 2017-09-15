


/*
*
* REQUIREMENTS
* - JavaScript Library and dependencies 'slideGallery.js'
* - JavaScript Library 'handlebars.js'
*
* DOM REQUIREMENTS
* - Element with id 'js-gallery'
*
* CSS Classes
* - The following CSS classes are used to create each slide of the gallery
* - CSS Class 'gallery__content'
* - CSS Class 'gallery__content__img'
* - CSS Class 'credits'
* - CSS Class 'credits--link'
* - CSS Class 'credits--image'
* - 
*
*
* NOTE
* - Element with id 'js-slide-gallery' is 'gallery' for slideGallery.js
* -
*/

        let entryLayout = "<div class='gallery__content js-slide-content'>";
        entryLayout += "<img class='gallery__content__img' src='{{imgURL}}'>";
        entryLayout += "<a class='credits credits--link credits--image' href='{{authorURL}}'>"
        entryLayout += "Photographer {{authorName}}";
        entryLayout += "</a>"
        entryLayout += "</div>";

/**
* Main module of the website
* @module
*/
var GalleryApp = (function() {
    
    var requestInProgress = false;
    
    
    /**
    * Loads new images into the gallery on the website.
    * Sends an xhr request to the unsplash photo api for random photos, requesting photos that 
    * are the size of the gallery.
    *
    * @function
    * @param {number} count=10 - How many images to load (max = 30)
    */
    function LoadNewImages(count = 10)
    {
        if(requestInProgress == true){return}
        
        let appID = 'fa50f60f26758ca6aa4c1abc0684aea5710ae8c7bd1a3bf0dc64122484a34557';
        let apiURL = 'https://api.unsplash.com/';
        let apiVersion = 'v1';

        let idealImgSize = Gallery.GallerySize();
        
        apiURL += 'photos/random';
        apiURL += '?';
        apiURL += 'count=' + count + '&';
        apiURL += 'w=' + idealImgSize.x + '&';
        apiURL += 'h=' + idealImgSize.y + '&';

        let xhr = new XMLHttpRequest();
        xhr.open('GET', apiURL);
        xhr.responseType = 'json';
        xhr.setRequestHeader('Accept-Version', apiVersion);
        xhr.setRequestHeader('Authorization', 'Client-ID ' + appID);
        xhr.onreadystatechange = RequestCallback;
        xhr.send();
        
        requestInProgress = true;

        function RequestCallback()
        {
            if(xhr.readyState == 4)
            {
                requestInProgress = false;
                if(xhr.status == '200')
                {
                    PopulateGallery(xhr.response);
                }
                else
                {
                    let errorObject = {
                        message: 'XHR Error. Unable to get response from Unsplash API',
                        xhrRequest: xhr}
                    console.error(errorObject);
                    alert('Unable to get photos from unsplash.com. \nCheck your connection or try again');
                }
            }
        }
    }
    

    
    /**
    * Creates gallery entries for each item in an Unsplash api response
    *
    * @function
    * @private
    * param {Object[]} unplashData - JSON response from the Unsplash API
    */
    function PopulateGallery(unsplashData)
    {
        Gallery.ClearGallery();
		
		let utmParameters = '?utm_source=slidegallery&utm_medium=referral&utm_campaign=api-credit';
		
        unsplashData.forEach(function(entry, index) {
            let imgURL = entry.urls.custom;
            let authorURL = entry.user.links.html;
            let authorName = entry.user.first_name + ' ' + entry.user.last_name;

            let resetGallery = false;
            if(index == unsplashData.length-1){ resetGallery = true }
            
            Gallery.NewEntry(imgURL, authorURL+utmParameters, authorName, resetGallery);
        });
    }



    /**
    * Handles the UI of the gallery element.
    *
    * @module
    * @memberof GalleryApp
    */
    let Gallery = (function(){
        let galleryID = 'js-gallery';
        let galleryElement = document.getElementById(galleryID);

        /** HTML layout used by Handlebars Template Engine*/
        let entryLayout = "<div class='gallery__content js-slide-content'>";
        entryLayout += "<img class='gallery__content__img' src='{{imgURL}}'>";
        entryLayout += "<a class='credits credits--link credits--image' href='{{authorURL}}'>"
        entryLayout += "Photographer {{authorName}}";
        entryLayout += "</a>"
        entryLayout += "</div>";
        
        let entryTemplate = Handlebars.compile(entryLayout);
        let temporaryDiv = document.createElement('div');
        
        
        if(galleryElement == undefined)
        {
            document.addEventListener('DOMContentLoaded', function Init(){
                galleryElement = document.getElementById(galleryID);
            });
        }
        
        /**
        * Removes all entries from the gallery
        * @function
        */
        function ClearGallery()
        {
            while(galleryElement.firstChild)
            {
                galleryElement.removeChild(galleryElement.lastChild);
            }
        }
        
        /**
        * Adds a new entry to the gallery
        *
        * @function
        * @param {string} imgURL - url to the image of the entry
        * @param {string} authorURL - url to the image's author's profile
        * @param {string} authorName - name of the image author
        * @param {boolean} resetGallery=false - to reset the gallery back to its starting position
        */
        function NewEntry(imgURL, authorURL, authorName, resetGallery=false)
        {
            let context = {imgURL:imgURL, authorURL:authorURL, authorName:authorName};
            let entryHTML = entryTemplate(context);

            temporaryDiv.innerHTML = entryHTML;
            galleryElement.appendChild(temporaryDiv.firstChild);
            temporaryDiv.innerHTML = '';
            
            if(resetGallery == true)
            {
                SlideGallery.ResetGallery(galleryElement);
            }
        }
        
        /**
        * Returns the size of the gallery element.
        * WARNING: size does not include padding.
        *
        * @function
        * @returns {Object} Object with x and y properties corisponding to width and height of the gallery
        */
        function GallerySize()
        {
            let size = {x:-1, y:-1}
            size.x = galleryElement.clientWidth;
            size.y = galleryElement.clientHeight;
            
            return size;
        }

        
        let module = {ClearGallery:ClearGallery, NewEntry:NewEntry, GallerySize: GallerySize};
        return module;
    }() );    



    let module = { LoadNewImages: LoadNewImages }
    return module;
}() );


window.addEventListener('load', ()=>{GalleryApp.LoadNewImages(10)} );





