import axios from "axios";
import querystring from "querystring";
// @ts-ignore
import encrypt from "NeteaseCloudMusicApi/util/crypto";

export interface Song {
  id: number;
  name: string;
  artists: { id: number; name: string }[];
  al: {
    id: number;
    name: string;
    picUrl: string;
  };
}

export const mapSong = (raw: any): Song => {
  const { id, name, artists = [], al = {} } = raw;
  return {
    id,
    name,
    artists: artists.map((it: any) => ({ id: it.id, name: it.name })),
    al: {
      id: al.id,
      name: al.name,
      picUrl: al.picUrl
    }
  };
};

class NeteaseApi {
  static async search(keywords: string) {
    let data = {
      s: keywords,
      type: 1, // 1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1004: MV, 1006: 歌词, 1009: 电台, 1014: 视频
      limit: 30,
      offset: 0
    };
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      // @ts-ignore
      formData.append(key, data[key]);
    });
    // @ts-ignore
    data.csrf_token = "";
    data = encrypt.weapi(data);
    const res = await axios.post(
      "https://music.163.com/weapi/search/get",
      querystring.stringify(data),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    if (res.status === 200) {
      const { code, result } = res.data;
      if (code === 200 && result.songs.length) {
        // const id = result.songs[0].id;
        // const res = await song_url({ id });
        // console.log(res.body.data);
        return result.songs[0];
      }
    }
    return null;
  }

  static async getHotList(id: string) {
    id = id || "3778678";
    let data = {
      id
    };
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      // @ts-ignore
      formData.append(key, data[key]);
    });
    // @ts-ignore
    data.csrf_token = "";
    data = encrypt.weapi(data);
    const res = await axios.post(
      "https://music.163.com/api/v6/playlist/detail",
      querystring.stringify(data),
      {
        params: {
          id
        },
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    if (res.status === 200) {
      const { code, playlist } = res.data;
      if (code === 200 && playlist) {
        return playlist.trackIds;
      }
    }
    return null;
  }

  static async getSongDetail(id: string) {
    let data = {
      c: `[{"id":${id}}]`,
      ids: `[${id}]`
    };
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      // @ts-ignore
      formData.append(key, data[key]);
    });
    // @ts-ignore
    data.csrf_token = "";
    data = encrypt.weapi(data);
    const res = await axios.post(
      "https://music.163.com/weapi/v3/song/detail?id=" + id,
      querystring.stringify(data),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        }
      }
    );
    if (res.status === 200) {
      const { code, songs } = res.data;
      if (code === 200 && songs && songs.length) {
        const [song] = songs;
        song.artists = song.ar;
        return mapSong(song);
      }
    }
    return null;
  }
}

export default NeteaseApi;
