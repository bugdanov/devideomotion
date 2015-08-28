/*                                                                                                                    
 * deviceOrientation.js
 *
 * Copyright (c) 2015 ALSENET SA - http://doxel.org
 * Please read <http://doxel.org/license> for more information.
 *
 * Author(s):
 *
 *      Rurik Bugdanov <rurik.bugdanov@alsenet.com>
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
* @constructor DeviceOrientation
* @param {Object} [options]
*   @param {Object}   [options.current] the initial orientation
*   @param {String}   [options.filterType] the filter to use
*   @param {Function} [options.onchange] called on threshold exceeded
*   @param {Object}   [options.threshold]
*     @param {Number}   [options.threshold.alpha] defaults to 1 degree
*     @param {Number}   [options.threshold.beta] defaults to 1 degree
*     @param {Number}   [options.threshold.gamma] defaults to 1 degree
* @return {Object} [deviceOrientation] instance
*/
var DeviceOrientation=function(options){
  if (!(this instanceof DeviceOrientation)) {
    return new DeviceOrientation(options);
  }
  this.init(options);

} // DeviceOrientation

$.extend(true,DeviceOrientation.prototype,{
  /**
  * @property deviceOrientation.defaults
  */
  defaults: {

    threshold: {
      alpha: 1,
      beta:  1,
      gamma: 1 
    },

    filterType: 'LPF2',

    onchange: function() {
      console.log(this.current);
    }

  },

  /**
  * @property deviceOrientation.previous
  *
  * the base values to check for threshold overflow 
  */

  previous: {
    alpha: 0,
    beta: 0,
    gamma: 0
  },

  /**
  * @property deviceOrientation.current
  *
  * the current values
  */

  current: {
    alpha: 0,
    beta: 0,
    gamma: 0
  },

  /**
  * @method deviceOrientation.init
  *
  * @param {Object} [options] properties and methods to set or override
  */
  init: function deviceOrientation_init(options){
    var deviceOrientation=this;

    // set or override properties and methods with options
    $.extend(true,deviceOrientation,deviceOrientation.defaults,options||{});

    deviceOrientation.setupEventHandlers();

  }, // deviceOrientation.init
 
  /**
  * @method deviceOrientation.setupEventHandlers
  */
  setupEventHandlers: function deviceOrientation_setupEventHandlers() {
    var deviceOrientation=this;

    window.addEventListener('ondeviceorientation',function(e) {
      deviceOrientation.ondeviceorientation(e);
    });

  }, // deviceOrientation_setupEventHandlers

  /**
  * @method deviceOrientation.ondeviceorientation
  */
  ondeviceorientation: function deviceOrientation_ondeviceorientation(e) {
    var deviceOrientation=this;

    deviceOrientation.update(e);

    if (deviceOrientation.onchange && deviceOrientation.hasChanged()) {
      deviceOrientation.onchange();
    }

  }, // deviceOrientation.ondeviceorientation

  /**
  * @method deviceOrientation.hasChanged
  *
  */
  hasChanged: function deviceOrientation_hasChanged() {
    var deviceOrientation=this;

    var current=deviceOrientation.current;
    var previous=deviceOrientation.previous;

    var delta={
      alpha: current.alpha-previous.alpha,
      beta: current.beta-previous.beta,
      gamma: current.gamma-previous.gamma
    }

    var changed = Math.abs(delta.alpha) > deviceOrientation.threshold.alpha ||
                  Math.abs(delta.beta ) > deviceOrientation.threshold.beta  ||
                  Math.abs(delta.gamma) > deviceOrientation.threshold.gamma;

    if (changed) {
      previous.alpha=current.alpha;
      previous.beta=current.beta;
      previous.gamma=current.gamma;
    }

    return changed;

  }, // deviceOrientation.hasChanged

  /**
  * @method deviceOrientation.update
  *
  */
  update: function deviceOrientation_update(measurement) {

    var deviceOrientation=this;

    // update current orientation using specified filter
    deviceOrientation.filter[deviceOrientation.filterType].method.apply(deviceOrientation,[measurement]);
      
  }, // deviceOrientation.update

  /**
  * @object deviceOrientation.filter
  */
  filter: {

    /**
    * @object deviceOrientation.filter.LPF
    */
    LPF: {

      /**
      * @method deviceOrientation.filter.LPF.method
      */
      method: function deviceOrientation_filter_LPF_method(measurement) { 
        var deviceOrientation=this;
        var current=deviceOrientation.current;
        var coefficient=deviceOrientation.filter.LPF.coefficient;
        
        current.alpha += coefficient * (measurement.alpha - current.alpha);
        current.beta += coefficient * (measurement.beta - current.beta);
        current.gamma += coefficient * (measurement.gamma - current.gamma);
      
      }, // deviceOrientation.filter.LPF.method

      /**
      * @property deviceOrientation.filter.LPF.coefficient
      */
      coefficient: 0.1

    }, // deviceOrientation.filter.LPF

    /**
    * @object deviceOrientation.filter.LPF2
    */
    LPF2: {

      /**
      * @method deviceOrientation.filter.LPF2.method
      */
      method: function deviceOrientation_filter_LPF2_method(measurement) { 
        var deviceOrientation=this;
        var current=deviceOrientation.current;
        var coefficient=deviceOrientation.filter.LPF2.coefficient;

        current.alpha = current.alpha * coefficient + (measurement.alpha * (1-coefficient));
        current.beta = current.beta * coefficient + (measurement.beta  * (1-coefficient));
        current.gamma = current.gamma * coefficient + (measurement.gamma * (1-coefficient));
      
      }, // method deviceOrientation.filter.LPF2.method

      /**
      * @property deviceOrientation.filter.LPF2.coefficient
      */
      coefficient: 0.1

    }, // deviceOrientation.filter.LPF2

    /**
     * @object deviceOrientation.filter.none
     */
    none: {

      /**
      * @method deviceOrientation.filter.none.method
      */
      method: function deviceOrientation_filter_none_method(measurement) { 
        var deviceOrientation=this;
        deviceOrientation.current.alpha = measurement.alpha;
        deviceOrientation.current.beta = measurement.beta;
        deviceOrientation.current.gamma = measurement.gamma;
      
      } // deviceOrientation.filter.none.method

    } // deviceOrientation.filter.none

  } // deviceOrientation.filter

}) // extend deviceOrientation.prototype

