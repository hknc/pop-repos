import axios, { AxiosInstance } from "axios"
import { stringify } from "qs"
import Env from "./Env"

const GITHUB_BASE_URL = Env.get("GITHUB_BASE_URL", "")

class HttpClient {
  private instance: AxiosInstance
  private baseURL: string

  constructor(baseURL: string) {
    this.baseURL = baseURL
    const axiosInstance = axios.create({
      baseURL: baseURL,
      headers: {
        "User-Agent": "pop-repos:v1",
        Accept: "application/vnd.github.v3+json",
      },
    })

    axiosInstance.defaults.paramsSerializer = this.paramsSerializer
    axiosInstance.defaults.withCredentials = true

    axiosInstance.interceptors.response.use((response) => response.data)

    this.instance = axiosInstance
  }

  public getInstance = () => {
    if (!this.instance) new HttpClient(this.baseURL)

    return this.instance
  }

  private paramsSerializer = (params: string[]) => stringify(params, { arrayFormat: "repeat" })
}

export const githubClient = new HttpClient(GITHUB_BASE_URL).getInstance()

export default HttpClient
