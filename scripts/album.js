var setSong = function(songNumber) {
   if (currentSoundFile) {
     currentSoundFile.stop();
   }

   currentlyPlayingSongNumber = parseInt(songNumber);
   currentSongFromAlbum = currentAlbum.songs[songNumber - 1];

   currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
      formats: [ 'mp3' ],
      preload: true
    });

   setVolume(currentVolume);
};

var seek = function(time) {
    if (currentSoundFile) {
        // setTime() -> buzz method to change position in a song to specific time
        currentSoundFile.setTime(time);
    }
};

var setVolume = function(volume) {
  if (currentSoundFile) {
    currentSoundFile.setVolume(volume);
  }
};

var getSongNumberCell = function(number) {
  return $('.song-item-number[data-song-number="' + number + '"]');
}

var createSongRow = function(songNumber, songName, songLength) {
     var template =
        '<tr class="album-view-song-item">'
      + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
      + '  <td class="song-item-title">' + songName + '</td>'
      + '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
      + '</tr>'
      ;

     var $row = $(template);

     var clickHandler = function() {
       var songNumber = parseInt($(this).attr('data-song-number'));

       if(currentlyPlayingSongNumber !== null) {
          var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
          currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
          currentlyPlayingCell.html(currentlyPlayingSongNumber);
      	}

       if (currentlyPlayingSongNumber !== songNumber) {
      		// Switch from Play -> Pause button to indicate new song is playing.
          setSong(songNumber);
          currentSoundFile.play();
          updateSeekBarWhileSongPlays();
          $(this).html(pauseButtonTemplate);
          currentSongFromAlbum = currentAlbum.songs[songNumber - 1];

          var $volumeFill = $('.volume .fill');
          var $volumeThumb = $('.volume .thumb');
          $volumeFill.width(currentVolume + '%');
          $volumeThumb.css({left: currentVolume + '%'});

          $(this).html(pauseButtonTemplate);
          updatePlayerBarSong();

      	} else if (currentlyPlayingSongNumber === songNumber) {
      		  if (currentSoundFile.isPaused()) {
                $(this).html(pauseButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPauseButton);
                currentSoundFile.play();
                updateSeekBarWhileSongPlays();
            } else {
                $(this).html(playButtonTemplate);
                $('.main-controls .play-pause').html(playerBarPlayButton);
                currentSoundFile.pause();
        }
      }
     };

     var onHover = function(event){
       var songNumberCell = $(this).find('.song-item-number');
       var songNumber = parseInt(songNumberCell.attr('data-song-number'));

       if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(playButtonTemplate);
       }
     };

     var offHover = function(event) {
       var songNumberCell = $(this).find('.song-item-number');
       var songNumber = parseInt(songNumberCell.attr('data-song-number'));

       if (songNumber !== currentlyPlayingSongNumber) {
            songNumberCell.html(songNumber);
       }
     };

     $row.find('.song-item-number').click(clickHandler);
     $row.hover(onHover, offHover);
     return $row;
 };

 var togglePlayFromPlayerBar = function() {
 // if current sound is paused then play
 // else if current sound is playing then pause
   var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
   if (currentSoundFile.isPaused()) {
     currentSoundFile.play();
     $('.main-controls .play-pause').html(playerBarPauseButton);
     currentlyPlayingCell.html(pauseButtonTemplate);
   } else {
     currentSoundFile.pause();
     $('.main-controls .play-pause').html(playerBarPlayButton);
     currentlyPlayingCell.html(playButtonTemplate);
   }
 }

var $albumTitle = $('.album-view-title');
var $albumArtist = $('.album-view-artist');
var $albumReleaseInfo = $('.album-view-release-info');
var $albumImage = $('.album-cover-art');
var $albumSongList = $('.album-view-song-list');


var setCurrentAlbum = function(album) {
    currentAlbum = album;

    $albumTitle.text(album.title);
    $albumArtist.text(album.artist);
    $albumReleaseInfo.text(album.year + ' ' + album.label);
    $albumImage.attr('src', album.albumArtUrl);

    $albumSongList.empty();

    for (var i = 0; i < album.songs.length; i++) {
         var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
         $albumSongList.append($newRow);
     }
};

var filterTimeCode = function(timeInSeconds) {
    var timeSeconds = parseFloat(timeInSeconds);
    var minutes = Math.floor(timeSeconds / 60);
    var seconds = "0" + Math.floor(timeSeconds % 60);
    seconds = seconds.slice(-2);
    console.log(minutes + ":" + seconds);

    // 05 -> 05;
    // 010 -> 10;
    return minutes + ":" + seconds;
}

var setCurrentTimeInPlayerBar = function(currentTime) {
    var $currentTime = $('.current-time');

    $currentTime.text(filterTimeCode(currentTime));
}

var setTotalTimeInPlayerBar = function(totalTime) {
    var $totalTime = $('.total-time');

    $totalTime.text(filterTimeCode(totalTime));
}

var updateSeekBarWhileSongPlays = function() {
    if (currentSoundFile) {
        // #10 timupdate -> buzz event that fires whil time elapses during song
        currentSoundFile.bind('timeupdate', function(event) {
            // #11 getTime() -> buzz event that gets current time
            // getDuration -> gets total length of song in secs
            var seekBarFillRatio = this.getTime() / this.getDuration();
            var $seekBar = $('.seek-control .seek-bar');

            updateSeekPercentage($seekBar, seekBarFillRatio);
            setCurrentTimeInPlayerBar(this.getTime());
        });
    }

};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
     // mult ration by 100 to determine percentage
     var offsetXPercent = seekBarFillRatio * 100;

     // #1
     // math.max -> to make sure % isn't < 0 & > 100
     offsetXPercent = Math.max(0, offsetXPercent);
     offsetXPercent = Math.min(100, offsetXPercent);

     // #2
     var percentageString = offsetXPercent + '%';
     $seekBar.find('.fill').width(percentageString);
     $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
        // #6 find all elements w/ class of "seek-bar" & contained w/i element w/ class of "player-bar"
    var $seekBars = $('.player-bar .seek-bar');

    $seekBars.click(function(event) {
         // #3 pageX holds X coordinate at event (where you clicked)
         var offsetX = event.pageX - $(this).offset().left;
         var barWidth = $(this).width();
         // #4
         var seekBarFillRatio = offsetX / barWidth;

         // #5
         if ($(this).parent().attr('class') == 'seek-control') {
            seek(seekBarFillRatio * currentSoundFile.getDuration());
         } else {
            setVolume(seekBarFillRatio * 100);
         }
         updateSeekPercentage($(this), seekBarFillRatio);
    });
         // #7 find el with class of thumb inside $seekbars
    $seekBars.find('.thumb').mousedown(function(event) {
         // #8 this = .thumb node
         var $seekBar = $(this).parent();

         // #9 bind is similar to addEventListener()
         // attach mousemove to $(document) to drag thumb after mousing down
         $(document).bind('mousemove.thumb', function(event) {
             var offsetX = event.pageX - $seekBar.offset().left;
             var barWidth = $seekBar.width();
             var seekBarFillRatio = offsetX / barWidth;

             if ($seekBar.parent().attr('class') == 'seek-control') {
                seek(seekBarFillRatio * currentSoundFile.getDuration());
             } else {
               setVolume(seekBarFillRatio);
             }

             updateSeekPercentage($seekBar, seekBarFillRatio);
         });

         // #10
         $(document).bind('mouseup.thumb', function() {
             $(document).unbind('mousemove.thumb');
             $(document).unbind('mouseup.thumb');
         });
     });
}

var nextSong = function() {
   var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
   // Note that we're _incrementing_ the song here
   currentSongIndex++;

   if (currentSongIndex >= currentAlbum.songs.length) {
       currentSongIndex = 0;
   }

   // Save the last song number before changing it
   var lastSongNumber = currentlyPlayingSongNumber;

   // Set a new current song
   setSong(currentSongIndex + 1);
   currentSoundFile.play();
   updateSeekBarWhileSongPlays();

   // Update the Player Bar information
   updatePlayerBarSong();

   var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
   var $lastSongNumberCell = getSongNumberCell(lastSongNumber);

   $nextSongNumberCell.html(pauseButtonTemplate);
   $lastSongNumberCell.html(lastSongNumber);
};


var previousSong = function() {
   var currentSongIndex = trackIndex(currentAlbum, currentSongFromAlbum);
   // Note that we're _decrementing_ the index here
   currentSongIndex--;

   if (currentSongIndex < 0) {
       currentSongIndex = currentAlbum.songs.length - 1;
   }

   // Save the last song number before changing it
   var lastSongNumber = currentlyPlayingSongNumber;

   // Set a new current song
   setSong(currentSongIndex + 1);
   currentSoundFile.play();
   updateSeekBarWhileSongPlays();

   // Update the Player Bar information
   updatePlayerBarSong();

   $('.main-controls .play-pause').html(playerBarPauseButton);

   var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
   var $lastSongNumberCell = getSongNumbercell(lastSongNumber);

   $previousSongNumberCell.html(pauseButtonTemplate);
   $lastSongNumberCell.html(lastSongNumber);
};

var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
};

var updatePlayerBarSong = function() {
    $('.currently-playing .song-name').text(currentSongFromAlbum.title);
    $('.currently-playing .artist-name').text(currentAlbum.artist);
    $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
    $('.main-controls .play-pause').html(playerBarPauseButton);
    setTotalTimeInPlayerBar(currentSongFromAlbum.duration);
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';


var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playPauseButton = $('.main-controls .play-pause');

$(document).ready(function() {
    setCurrentAlbum(albumPicasso);
    setupSeekBars();
    $previousButton.click(previousSong);
    $nextButton.click(nextSong);
    $playPauseButton.click(togglePlayFromPlayerBar);

    // var albums = [albumPicasso, albumMarconi, albumKlimt];
    // var i = 1;
    // albumImage.addEventListener("click", function(event){
    //   setCurrentAlbum(albums[i]);
    //   i += 1
    //
    //   if (i == albums.length)
    //     i = 0;
    // });
 });
