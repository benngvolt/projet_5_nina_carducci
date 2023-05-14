(function($) {
  
  //---------------------------------------------------

  // création d'une méthode "mauGallery"

  //---------------------------------------------------

  $.fn.mauGallery = function(options) {
    // la méthode .extend merge deux objets. Ici, merge des options avec paramètres par défaut
    var options = $.extend($.fn.mauGallery.defaults, options);
    // création d'un tableau
    var tagsCollection = [];
    // boucle sur tous les éléments sélectionnés et exécute une fonction pour chacun d'eux.
    return this.each(function() {
      // Création d'un conteneur pour chaque rangée de la galerie
      $.fn.mauGallery.methods.createRowWrapper($(this));
      // Si l'utilisateur a activé la lightbox, création de la lightbox
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }  
      // Ajout des listeners pour les événements de clic sur la galerie  
      $.fn.mauGallery.listeners(options);

      // Boucle sur chaque élément enfant ayant la classe .gallery-item
      $(this)
        .children(".gallery-item")
        .each(function(index) {
          // Redimensionnement de l'image pour l'affichage en grille
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          // Déplacement de l'élément dans le conteneur de rangée correspondant
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          // Enveloppement de l'élément dans la colonne correspondante
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          // Récupération du tag associé à l'élément
          var theTag = $(this).data("gallery-tag");
          // Si l'affichage des tags est activé, ajout du tag au tableau de tags si celui-ci n'a pas déjà été ajouté
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });
      // Si l'affichage des tags est activé, affichage des tags sur la galerie
      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }
      // Affichage de la galerie en fondu
      $(this).fadeIn(500);
    });
  };

  //---------------------------------------------------

  // définition des paramètres par défault de "mauGallery"

  //---------------------------------------------------

  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  //---------------------------------------------------

  // listeners

  //---------------------------------------------------

  $.fn.mauGallery.listeners = function(options) {
    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });
    $(".gallery").on("click", ".nav-link", function() {
      console.log("hourra");
      $.fn.mauGallery.methods.filterByTag(this);
    })
    // IL MANQUAIT UNE ACCOLADE APRES LA FLECHE DE LA FONCTION FLECHEE
    $(".modal-body").on("click", ".mg-prev", () => {
      $.fn.mauGallery.methods.prevImage(options.lightboxId);
      console.log("PREV");
    });

    $(".modal-body").on("click", ".mg-next", () => {
      $.fn.mauGallery.methods.nextImage(options.lightboxId);
      console.log("NEXT");
    });
  };


  //---------------------------------------------------

  // définition des méthodes de "mauGallery"

  //---------------------------------------------------


  $.fn.mauGallery.methods = {
  


    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },



    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },
    



    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },




    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },




    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },




    prevImage() {
      
      // On trouve l'image actuellement active dans la lightbox
      let activeImage = null;
      $("img.gallery-item").each(function() {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      console.log(activeImage.attr("src")); //test pour voir si cette partie du code fonctionne= OK

      // On construit une collection des images affichées
      let imagesCollection = [];
      
      $(".item-column").each(function() {
        if ($(this).children("img")) {
          imagesCollection.push($(this).children("img"));
        }
      })
      console.log (imagesCollection.length);
      
      let imageFound = false;

      $(imagesCollection).each(function(i) {
        if (!imageFound) {
          let thisImg = $(this);
        
          if (thisImg.is(activeImage)) {
            let activeImageIndex = i;
            let prevImageIndex = activeImageIndex - 1;
            if (prevImageIndex < imagesCollection.length && prevImageIndex >= 0) {
              activeImage = imagesCollection[prevImageIndex];
              console.log(activeImage.attr("src"));
              $(".lightboxImage").attr("src", activeImage.attr("src"));
              imageFound = true;
            } else if (prevImageIndex < 0) {
              activeImage = imagesCollection[imagesCollection.length - 1];
              console.log(activeImage.attr("src"));
              $(".lightboxImage").attr("src", activeImage.attr("src"));
              imageFound = true;
            }
          }
        }
      })
    },


    nextImage() {

      // On trouve l'image actuellement active dans la lightbox
      let activeImage = null;
      $("img.gallery-item").each(function() {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      console.log(activeImage.attr("src")); //test pour voir si cette partie du code fonctionne= OK

      // On construit une collection des images affichées
      let imagesCollection = [];
      
      $(".item-column").each(function() {
        if ($(this).children("img")) {
          imagesCollection.push($(this).children("img"));
        }
      })
      console.log (imagesCollection.length);
      let imageFound = false;

      $(imagesCollection).each(function(i) {
        if (!imageFound) {
          let thisImg = $(this);
        
          if (thisImg.is(activeImage)) {
            let activeImageIndex = i;
            let nextImageIndex = activeImageIndex + 1;
            console.log (activeImageIndex);
            console.log (nextImageIndex);
            console.log (imagesCollection.length);
            if (nextImageIndex < imagesCollection.length) {
              activeImage = imagesCollection[nextImageIndex];
              console.log(activeImage.attr("src"));
              $(".lightboxImage").attr("src", activeImage.attr("src"));
              imageFound = true;
            } else if (nextImageIndex >= imagesCollection.length -1) {
              activeImage = imagesCollection[0];
              console.log(activeImage.attr("src"));
              $(".lightboxImage").attr("src", activeImage.attr("src"));
              imageFound = true;
            }
          }
        }
      })
    },


    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${
                              navigation
                                ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
    },




    showItemTags(gallery, position, tag) {
      var tagItems =
        '<li class="nav-item"><h3 class="nav-link active active-tag"  data-images-toggle="all">Tous</h3></li>';
      $.each(tag, function(index, value) {
        tagItems += `<li class="nav-item active">
                <h3 class="nav-link"  data-images-toggle="${value}">${value}</h3></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },


    filterByTag(navLink) {

        if ($(navLink).hasClass("active-tag")) {
          console.log("il a active tag");
          return;

        } else {

          console.log("NO active tag");
          $(".active-tag").removeClass("active active-tag");
          $(navLink).addClass("active-tag active");

          var tag = $(navLink).data("images-toggle");

          $(".gallery-item").each(function() {
            $(this)
              .parents(".item-column")
              .hide();
            if (tag === "all") {
              $(this)
                .parents(".item-column")
                .show(300);
            } else if ($(this).data("gallery-tag") === tag) {
              $(this)
                .parents(".item-column")
                .show(300);
            }
          });
        }   
    }
  };
})(jQuery);
