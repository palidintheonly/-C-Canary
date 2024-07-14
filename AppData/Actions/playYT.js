module.exports = {
  data: {
    name: "Play YouTube Song",
  },
  category: "Music",
  UI: [
    {
      element: "input",
      name: "URL",
      placeholder: "YouTube Video URL",
      storeAs: "url",
    },
    "-",
    {
      element: "dropdown",
      name: "Queuing",
      storeAs: "queuing",
      extraField: "queuePosition",
      choices: [
        { name: "Don't Queue, Just Play" },
        { name: "At End Of Queue" },
        { name: "At Start Of Queue" },
        {
          name: "At Custom Position",
          field: true,
          placeholder: "Queue Starts At #0",
        },
      ],
    },
    "-",
    {
      element: "dropdown",
      name: "Quality",
      storeAs: "quality",
      choices: [
        { name: "Default" },
        { name: "Good" },
        { name: "Bad" },
      ]
    },
    "-",
    {
      element: "dropdown",
      name: "Memory Allocation",
      storeAs: "memoryAllocation",
      choices: [
        { name: "Default" },
        { name: "128 Kilobytes" },
        { name: "256 Kilobytes" },
        { name: "1 Megabyte" },
        { name: "5 Megabytes" },
        { name: "Whole Song" },
      ],
    },
  ],
  subtitle: (values, constants) => {
    return `URL: ${values.url} - ${values.queuing}`;
  },
  compatibility: ["Any"],
  async run(values, message, client, bridge) {
    const ytdl = require("@distube/ytdl-core");
    const { createAudioResource } = require("@discordjs/voice");
    const { StreamType } = require("@discordjs/voice");

    let hWMs = {
      Default: 512,
      "128 Kilobytes": 128,
      "256 Kilobytes": 256,
      "1 Megabyte": 1024,
      "5 Megabytes": 5000,
      "Whole Song": 99999,
    };

    let qualities = {
      "Default": 256,
      "Good": 512,
      "Bad": 128
    }

    let search = require("yt-search");

    let result = await search(bridge.transf(values.url));
    const songInfo = await ytdl.getInfo(result.videos[0].videoId);
    const format = ytdl.chooseFormat(songInfo.formats, {
      filter: "audioonly"
    });
    const stream = ytdl.downloadFromInfo(songInfo, {
      format
     });

    let audio = createAudioResource(stream);

    let utilities = bridge.getGlobal({
      class: "voice",
      name: bridge.guild.id,
    });


    switch (values.queuing) {
      case `Don't Queue, Just Play`:
        utilities.player.play(audio);
        utilities.nowPlaying = {
          file: null,
          name: result.videos[0].title,
          author: result.videos[0].author.name,
          url: bridge.transf(values.url),
          src: "YouTube",
          audio,
          raw: result.videos[0]
        };
        client.emit('trackStart', bridge.guild, utilities.channel, utilities.nowPlaying);
        break;

      case `At End Of Queue`:
        utilities.addToQueue(utilities.queue.length, {
          file: null,
          name: result.videos[0].title,
          author: result.videos[0].author.name,
          url: bridge.transf(values.url),
          src: "YouTube",
          audio: audio,
          raw: result.videos[0]
        });
        break;

      case `At Start Of Queue`:
        utilities.addToQueue(0, {
          file: null,
          name: result.videos[0].title,
          author: result.videos[0].author.name,
          url: bridge.transf(values.url),
          src: "YouTube",
          audio: audio,
          raw: result.videos[0]
        });
        break;

      case `At Custom Position`:
        utilities.addToQueue(Number(bridge.transf(values.queuePosition)), {
          file: null,
          name: result.videos[0].title,
          author: result.videos[0].author.name,
          url: bridge.transf(values.url),
          src: "YouTube",
          audio: audio,
          raw: result.videos[0]
        });
        break;
    }
  },
};
