import { SOURCES } from "../data/content";

export function SourcesSection() {
  return (
    <section className="sources-section" id="sources">
      <div className="sources-inner">
        <h2>المصادر والمراجع</h2>
        <p className="sources-intro">
          استُقيت المعلومات التاريخية في هذه التجربة من مصادر صحفية وموسوعية سعودية متاحة للعموم. حيث تعذّر توثيق
          تفصيل ما (كالنقوش الأثرية أو أحداث توحيد الدولة المرتبطة تحديدًا بالقويعية)، تم الاكتفاء بمشهد تصويري عام
          دون اختلاق معلومات. المشاهد المعمارية للبلدات القديمة وبرج الرقيبة هي إعادة تصور رقمية اجتهادية بناءً على
          الأوصاف المتاحة، وليست نماذج مسح دقيقة للمواقع الفعلية.
        </p>
        <ol className="sources-list">
          {SOURCES.map((s) => (
            <li key={s.url}>
              <a href={s.url} target="_blank" rel="noreferrer noopener">
                {s.title}
              </a>
            </li>
          ))}
        </ol>
        <p className="sources-footer">
          صُممت هذه التجربة الرقمية وبُنيت باستخدام Three.js و React Three Fiber و GSAP. جميع النماذج ثلاثية الأبعاد
          إجرائية (procedural)، والموسيقى التصويرية توليدية بالكامل عبر Web Audio API دون استخدام أي مواد محمية
          بحقوق نشر.
        </p>
      </div>
    </section>
  );
}
