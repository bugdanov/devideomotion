/*
 * view.js
 *
 * Copyright (c) 2015 ALSENET SA - http://doxel.org
 * Please read <http://doxel.org/license> for more information.
 *
 * Author(s):
 *
 *      Rurik Bogdanov <rurik.bugdanov@alsenet.com>
 *
 * This file is part of the DOXEL project <http://doxel.org>.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * Additional Terms:
 *
 *      You are required to preserve legal notices and author attributions in
 *      that material or in the Appropriate Legal Notices displayed by works
 *      containing it.
 *
 *      You are required to attribute the work as explained in the "Usage and
 *      Attribution" section of <http://doxel.org/license>.
 */

/**
* @constructor View
*
* @param {Object}        [options]
*   @param {String}         [options.url]       The html code for the view
*   @param {Object|String}  [options.parent]    Where to append the view
*   @param {String}         [options.container] Selector for the view's wrapper element in the html
*   @param {String}         [options.classname] Added to view.container in order to trigger stylesheet's css rules
*
* @return {Object} [view] the view instance
*
* @event {load} the view is loaded
*
*/
function View(options) {
  if (!(this instanceof View)) {
    return new View(options);
  }

  $.extend(true,this,this.defaults,options);

} // View

$.extend(true,View.prototype,{

  /**
  * @property View.defaults
  */
  defaults: {

    // the html code for the view
    url: 'view.html',

    // where to append the view
    parent: 'body',

    // the view's wrapper element in the html
    container: 'div#view',

    // added to container in order to apply stylesheet's css rules
    className: 'view'

  }, // defaults

  /**
   * @method View.getElem
   *
   * @return {Object} [$container] jQuery object for the view.container
   *
   */
  getElem: function view_getElem(){
      var view=this;
      return $(view.container,view.parent);

  }, // view.getElem

  /**
   * @method View.show
   *
   * load and setup the view if not yet loaded,
   * then fire the view 'load' event
   *
   */
  show: function view_show() {
    var view=this;
    var elem=view.getElem();

    if (!elem.length) {
      // html not yet loaded
      $.ajax({

        cache: false,
        dataType:'html',
        url: view.url,

        success: function(html){
          $(view.parent).append(html);

          viewElem=view.getElem();
          viewElem.addClass(view.className);

          $(view).trigger('load',[view]);
        },

        error: function() {
          alert('Could not load '+view.url);
        }

      }); // ajax

      return;
    }

    $(view).trigger('load',[view]);

  }, // view.show

  /**
   * @method View.onload
   *
   * @param {Object} [e] the event
   * @param {Object} [view] the view
   *
   */
  onload: function view_onload(e,view){
    $(view).trigger('ready');

  } // view.onload

}); // extend View.prototype
