// services/storyService.js
import axios from "axios";

const API_URL = "http://localhost:3000/api/stories";

export const getStories = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const postStory = async (storyData) => {
  const res = await axios.post(API_URL, storyData);
  return res.data;
};

