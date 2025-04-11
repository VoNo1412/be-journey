
import * as bcrypt from 'bcrypt';

/**
 * 
 *  @param cost số lần lăp 2^10 băm
 *  user login -> hash(lấy salt từ hash-password + password raw) -> hash_password login compare hasspassword from db
 */

export async function hashPassword(password: string) {
    const cost = 10;
    const hash = await bcrypt.hash(password, cost);
    return hash;
}