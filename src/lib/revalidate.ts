import { revalidatePath } from "next/cache";

/** Call after any admin mutation that could affect storefront content (products,
 * sections, hero/gallery images, nav, settings, shipping, testimonials, stock). */
export function revalidateStorefront() {
  revalidatePath("/", "layout");
}
