$(document).ready(function () {
  const playPause = $("#play-stop"),
    backward = $("#backward"),
    forward = $("#forward"),
    progressControl = $("#progress"),
    songInput = $("#search"),
    songList = $("#song-list"),
    songName = $("#song-name"),
    audio = $("#song"),
    coverArt = $("#cover"),
    indexDisplay = $("#index"),
    musicbox = $("#track-list");

  const playImg = "./svg/play.png",
    pauseImg = "./svg/pause.png";

  let isPlaying = false,
    songIndex = 0,
    filteredSongs = [...songs];

  $("#volume-img").on("click", function () {
    $("#song")[0].volume = 0;
    $("#volume").val(0);
    $("#volume-img").attr("src", "./svg/volume-0.svg");
  });

  $("#volume").on("input", function () {
    $("#song")[0].volume = $(this).val() / 100;
    if ($(this).val() >= 75) {
      $("#volume-img").attr("src", "./svg/volume-3.svg");
    } else if ($(this).val() < 75 && $(this).val() >= 50) {
      $("#volume-img").attr("src", "./svg/volume-2.svg");
    } else if ($(this).val() < 50 && $(this).val() >= 20) {
      $("#volume-img").attr("src", "./svg/volume-1.svg");
    } else if ($(this).val() < 20) {
      $("#volume-img").attr("src", "./svg/volume-0.svg");
    }
  });
  const loadUpcomingSong = () => {
    if (filteredSongs.length === 0) return;
    const nextSong = filteredSongs[(songIndex + 1) % filteredSongs.length];
    $("#upcoming-song-name").text(`${nextSong.artist} - ${nextSong.name}`);
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  
  const loadMusic = () => {
    if (filteredSongs.length === 0) return;
    const song = filteredSongs[songIndex];
    coverArt.attr("src", song.album);
    songName.text(song.name);
    audio.attr("src", song.path);
    indexDisplay.text(`Song ${songIndex + 1} of ${filteredSongs.length}`);
    progressControl.val(0);
   
    document.title = `${song.artist} - ${song.name}`;
    loadUpcomingSong();
  };

  const togglePlayPause = () => {
    isPlaying ? pauseSong() : playSong();
  };

  const playSong = () => {
    if (filteredSongs.length === 0) return;
    playPause.attr("src", pauseImg);
    audio[0].play();
    isPlaying = true;
    updateIcons();
  };

  const pauseSong = () => {
    playPause.attr("src", playImg);
    audio[0].pause();
    isPlaying = false;
    updateIcons();
    loadMusic();
  };

  const changeSong = (direction) => {
    if (filteredSongs.length === 0) return;
    songIndex =
      (songIndex + direction + filteredSongs.length) % filteredSongs.length;
    loadMusic();
    playSong();
  };

  const updateIcons = () => {
    $(".track-item").each(function () {
      $(this).find(".play-icon").show();
      $(this).find(".pause-icon").hide();
    });

    if (isPlaying) {
      $(`.track-item[data-index="${songIndex}"] .play-icon`).hide();
      $(`.track-item[data-index="${songIndex}"] .pause-icon`).show();
    }
  };

  audio.on("timeupdate", function () {
    progressControl.val((this.currentTime / this.duration) * 100);
    $("#current-time").text(formatTime(this.currentTime));
  });

  audio.on("loadedmetadata", function () {
  $("#duration-time").text(formatTime(this.duration));
});
  audio.on("ended", () => changeSong(1));

  progressControl.on("input", function () {
    audio.prop("currentTime", ($(this).val() / 100) * audio[0].duration);
  });

  playPause.on("click", togglePlayPause);
  backward.on("click", () => changeSong(-1));
  forward.on("click", () => changeSong(1));

  const createPlayList = () => {
    musicbox.empty();
    songList.empty();
    filteredSongs.forEach((song, i) => {
      const li = $(`<li class="track-item" data-index="${i}"></li>`).append(
        `<img src="${song.album}" class="track-image" alt="${song.name}">`,
        `<div class="track-info">` +
          `<span class="track-name">${song.name}</span>` +
          `<span class="track-author">${song.artist}</span>` + // Author name
          `</div>`,
        `<span class="track-duration">${formatTime(song.duration)}</span>`,
        `<div class="icon-container">
           <i class="bi bi-play-fill play-icon"></i>
           <i class="bi bi-pause-fill pause-icon" style="display:none;"></i>
         </div>`
      );
      musicbox.append(li);
      songList.append(`<option value="${song.name}" data-index="${i}">`);
      li.find(".play-icon").on("click", () => {
        songIndex = i;
        loadMusic();
        playSong();
      });
      li.find(".pause-icon").on("click", pauseSong);
    });
  };
  const filterSongs = (term) => {
    filteredSongs = songs.filter(
      (song) =>
        song.name.toLowerCase().includes(term) ||
        song.artist.toLowerCase().includes(term)
    );
    createPlayList();
    songIndex = 0;
    if (filteredSongs.length > 0) {
      loadMusic();
    }
  };

  songInput.on("input", function () {
    filterSongs($(this).val().toLowerCase());
  });

 
  songList.on("change", function () {
    const selectedSongIndex = $(this).find("option:selected").data("index");
    if (selectedSongIndex !== undefined) {
      songIndex = selectedSongIndex;
      loadMusic();
      playSong();
    }
  });

  const progressTooltip = $("#progress-tooltip");
  progressControl.on("mouseenter", function (event) {
    progressTooltip.css({
      visibility: "visible",
      opacity: 1,
    });
  });
  progressControl.on("mousemove", function (event) {
    const progressWidth = $(this).width();
    const offsetX = event.pageX - $(this).offset().left;
    const percentage = (offsetX / progressWidth) * 100;
    const duration = audio[0].duration;
    const currentTime = (percentage / 100) * duration;
    progressTooltip.text(formatTime(currentTime));
    progressTooltip.css({
      left: `${offsetX}px`,
      top: `-30px`,
    });
  });
  progressControl.on("mouseleave", function () {
    progressTooltip.css({
      visibility: "hidden",
      opacity: 0,
    });
  });

  createPlayList();
  if (filteredSongs.length > 0) {
    loadMusic();
  }
});