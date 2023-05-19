(function($) {
  
  //---------------------------------------------------

  // création d'une méthode "mauGallery"

  //---------------------------------------------------

  $.fn.mauGallery = function(options) {
    var options = $.extend($.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function() {
      $.fn.mauGallery.methods.createRowWrapper($(this));
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }  
      $.fn.mauGallery.listeners(options);

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
        element.append('<ul class="gallery-items-row row"></ul>');
      }
    },



    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<li class='item-column mb-4 col-${Math.ceil(12 / columns)}'></li>`
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
        element.wrap(`<li class='item-column mb-4${columnClasses}'></li>`);
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

      // On construit une collection des images affichées, dans un tableau
      let imagesCollection = [];
        $(".item-column").each(function() {
          let img = $(this).children("img");
          if (img.length && img.is(":visible")) {
            imagesCollection.push(img);
          }
        });
        console.log(imagesCollection.length); //test pour voir le nombre d'images de la collection

      // Déclaration d'une variable pour indiquer si une image a déjà été trouvée, avant de poursuivre les itérations restantes
      let imageFound = false;

      $(imagesCollection).each(function(i) {
        // Si l'image n'a pas encore été trouvée, déclaration d'une variable pour stocker l'image en cours d'examination
        if (!imageFound) {
          let thisImg = $(this);
          
          // Pour l'image en cours d'examination, vérification s'il s'agit de l'image affichée dans la modale.
          if (thisImg.is(activeImage)) {
            // Si c'est le cas, définition de l'index du tableau i correspondant à l'image affichée
            let activeImageIndex = i;

            // Définition de l'index du tableau correspondant à l'image précédente
            let prevImageIndex = activeImageIndex - 1;
            
            // Si l'image précédente à l'image en cours est la première de la collection ou supérieure, affichage de l'image précédente
            if (prevImageIndex < imagesCollection.length && prevImageIndex >= 0) {
              activeImage = imagesCollection[prevImageIndex];
              console.log(activeImage.attr("src"));
              $(".lightboxImage").attr("src", activeImage.attr("src"));
              imageFound = true;

              // Si l'image précédente à l'image en cours a un index négatif, alors affichage de la dernière image de la collection
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

      // Même procédé que pour prevImage mais pour l'image suivante
      let activeImage = null;
      $("img.gallery-item").each(function() {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      console.log(activeImage.attr("src"));

      let imagesCollection = [];
      
      $(".item-column").each(function() {
        let img = $(this).children("img");
        if (img.length && img.is(":visible")) {
          imagesCollection.push(img);
        }
      });
      console.log(imagesCollection.length);
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
        // l'élément navLink n'était pas attribué à la fonction filterByTag, d'où le dysfonctionnement
        if ($(navLink).hasClass("active-tag")) {
          console.log("il a active-tag");
          return;

        } 

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
  };
})(jQuery);
