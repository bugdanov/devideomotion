/*
 * main.js
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
* @object views
*/
var views={

  /**
  *  @object views.video
  */
  video: new View({

    container: 'div#video',
    url: 'view/video.html',
    fps: 30,

    /**
    * @property views.video.maxGamma
    *
    * @value {Number} degrees - clamp deviceOrientation gamma to +/- this value
    *
    */
    maxGamma: 37.5,

    /**
    * @property views.video.transition
    *
    * @value {String} "jump" - jump to target frame on deviceOrientation change event
    * @value {String} "seek" - play video continuously up to target frame, stop on gamma < threshold
    *
    */
    transition: "jump",

    /**
    * @property views.video.threshold
    *
    * @value {Number} angle - when transition == "seek", video playback will stop when gamma is lesser than this
    *
    */
    threshold: 10,

    /**
    * @method views.video.onready
    */
    onready: function views_video_onready() {
      views.video.videojs_init();

    }, // views.video.onready

    /**
    * @method views.video.videojs_init
    */
    videojs_init: function views_video_videojs_init() {

      var count=0;
      views.video.player=videojs('test')
        .on('canplaythrough', function views_video_player_oncanplaythrough(){
           ++count;
           if (count==1) {
             views.video.player.currentTime(views.video.player.duration());
             views.video.player.currentTime(views.video.player.duration()/2);
             views.video.getElem().removeClass('hidden');
             views.video.canplaythrough=true;

             // compute frame count (fps must be known)
             views.video.frameCount=Math.floor(views.video.player.duration()*views.video.fps+1);

             // set gamma threshold to one frame
             webapp.deviceOrientation.threshold.gamma=(2*views.video.maxGamma)/views.video.frameCount;

           } else {
             console.log('canplaythrough');
             return;
           }

        })
        .ready(function views_video_player_onready(){
           var player = this;
        })
        .on('play',function views_video_player_onplay(){
          views.video.player.pause();
          views.video.ready=true;

        })
        .on('seeked',function views_video_player_onseeked(){

          $('.info',views.video.container).text('Frame '+(views.video.getCurrentFrameNumber()+1)+'/'+views.video.frameCount);

          if (views.video.seeking) {
            views.video.seekNext();
          }
        });

    }, // views.video.videojs_init

    /**
    * @method views.video.getCurrentFrameNumber
    * @return {Number} [frame] current frame number
    *
    */
    getCurrentFrameNumber: function views_video_getCurrentFrameNumber() {
      return Math.floor(views.video.player.currentTime()*views.video.fps);
    }, // views_video_getCurrentFrameNumber

    /**
     * @method views.video.jump
     * @param {Number} [seconds] the target video position
     *
     */
    jump: function views_video_jump(targetTime) {
        views.video.player.currentTime(targetTime);

    }, // views.video.jump

    /**
     * @method views.video.seek
     * @param {Number} [seconds] the target video position
     *
     */
    seek: function views_video_seek(targetTime) {

      var currentTime=views.video.player.currentTime();

      views.video.targetTime=targetTime;
      views.video.incr=views.video.targetTime>currentTime?1:-1;
      views.video.incr/=views.video.fps;

      if (!views.video.seeking) {
        views.video.seeking=true;
        views.video.seekNext();
      }

    }, // views.video.seek

    /**
    * @method views.video.seekNext
    */
    seekNext: function views_video_seekNext() {

      var currentTime=views.video.player.currentTime();
      var nextFrame=currentTime+views.video.incr;

      if (Math.abs(nextFrame-views.video.targetTime)>=Math.abs(views.video.incr) && nextFrame>=0 && nextFrame<=views.video.player.duration()) {
        views.video.player.currentTime(nextFrame);

      } else {
        views.video.seeking=false;
      }

    }, // vies.video.seekNext

    /**
    * @method views.video.ondeviceorientationchange
    */
    ondeviceorientationchange: function() {

      if (!views.video.ready) {
        return;
      }

      console.log('change');

      if (!views.video.player.paused()) {
        views.video.player.pause();
      }

      var deviceOrientation=this;
      var gamma=deviceOrientation.current.gamma;
      gamma=Math.max(gamma,-views.video.maxGamma);
      gamma=Math.min(gamma,views.video.maxGamma);

      if (views.video.transition=="seek") {
        if (Math.abs(gamma)<views.video.threshold) {
          // stop seeking
          views.video.targetTime=views.video.player.currentTime();
          return;
        }
      }

      var targetTime=views.video.player.duration()*(gamma+views.video.maxGamma)/(2*views.video.maxGamma);

      views.video[views.video.transition](targetTime);

    }, // views.video.ondeviceorientationchange

  }) // views.video

} // views

/**
* @object webapp
*/
var webapp={

  /**
  * @property webapp.defaults
  */
  defaults: {
    initialView: views.video
  },

  /**
  * @method webapp.init
  *
  * @param {Object} [options] override or set properties, methods and defaults
  */
  init: function webapp_init(options){
    $.extend(true,webapp,webapp.defaults,options);

    /**
    * @object webapp.deviceOrientation
    */
    webapp.deviceOrientation=new DeviceOrientation({

      /**
      * @property webapp.deviceOrientation.filterType
      */
      filterType: 'LPF2',

      /**
      * @property webapp.deviceOrientation.threshold
      */
      threshold: {
        alpha: 999,
        beta: 999
        // gamma to be set on video ready
      },

      /**
      * @method webapp.deviceOrientation.onchange
      */
      onchange: views.video.ondeviceorientationchange,

      /**
      * @method webapp.deviceOrientation.setupEventHandlers
      */
      setupEventHandlers: function webapp_deviceOrientation_setupEventHandlers() {
        webapp.gyronorm.init();

      } // webapp.deviceOrientation.setupEventHandlers

    }); // webapp.deviceOrientation

    webapp.initialView.show();

  }, // webapp.init

  /**
  * @object webapp.gyronorm
  */
  gyronorm: {

    /**
    * @method webapp.gyronorm.init
    */
    init: function webapp_gyronorm_init() {
      var gyronorm=this;
      var args = {
        logger: gyronorm.logger
      };

      var gn = gyronorm.gn = new GyroNorm();

      gn.init(args).then(function() {
        var isAvailable = gn.isAvailable();
        if(!isAvailable.deviceOrientationAvailable) {
          gyronorm.logger({message:'Device orientation is not available.'});
        }

        if(!isAvailable.accelerationAvailable) {
          gyronorm.logger({message:'Device acceleration is not available.'});
        }

        if(!isAvailable.accelerationIncludingGravityAvailable) {
          gyronorm.logger({message:'Device acceleration incl. gravity is not available.'});
        }

        if(!isAvailable.rotationRateAvailable) {
          gyronorm.logger({message:'Device rotation rate is not available.'});
        }

        gyronorm.start();

      }).catch(function(e){
        console.log(e);
      });

    }, // webapp_gyronorm_init

    /**
    * @method webapp.gyronorm.logger
    */
    logger: function logger(data) {
      console.log(data.message + "\n");
    },

    /**
    * @method webapp.gyronorm.stop
    */
    stop: function webapp_gyronorm_stop() {
      var gyronorm=this;
      gyronorm.gn.stop();
    },

    /**
    * @method webapp.gyronorm.start
    */
    start: function webapp_gyronorm_start() {
      var gyronorm=this;
      gyronorm.gn.start(gyronorm.callback);
    },

    /**
    * @method webapp.gyronorm.callback
    */
    callback: function webapp_gyronorm_callback(data) {
      // discard alpha and beta
      data.do.alpha=0;
      data.do.beta=0;

      // update orientation
      webapp.deviceOrientation.ondeviceorientation(data.do);

    } // webapp.gyronorm.callback

  } // webapp.gyronorm

} // webapp

// initialize application
$(document).ready(function(){
  webapp.init();
});
