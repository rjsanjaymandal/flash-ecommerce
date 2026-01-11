export type Result<T, E = string> = 
  | { success: true; data: T }
  | { success: false; error: E };

export const ok = <T>(data: T): Result<T, never> => ({ success: true, data });
export const err = <E = string>(error: E): Result<never, E> => ({ success: false, error });

/**
 * Helper to wrap async functions that might throw
 */
export async function safe<T>(promise: Promise<T>): Promise<Result<T, string>> {
    try {
        const data = await promise;
        return ok(data);
    } catch (e: unknown) {
        if (e instanceof Error) {
            return err(e.message);
        }
        return err(String(e));
    }
}
