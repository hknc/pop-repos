import { AxiosResponse } from "axios"
import { response } from "express"
import { githubClient } from "../utils/HttpClient"

class GitHubService {
  public static getRepos = async (): Promise<AxiosResponse> => {
    return await githubClient.get(`/repositories?q=created:>2019-01-10&sort=stars&order=desc`)
  }
}

export default GitHubService
