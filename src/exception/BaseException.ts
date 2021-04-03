export default abstract class BaseException extends Error {
  public status = 500
  public code = "UNKNOWN_ERROR"
}
