import { Star, Quote } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const testimonials = [
  {
    name: "Dr. Rajesh Sharma",
    specialty: "General Physician",
    city: "Jaipur",
    initials: "RS",
    quote:
      "ShadowMD has transformed my OPD workflow. I see 60+ patients daily and the AI differential diagnosis saves me critical thinking time on complex cases. It's like having a senior consultant always available.",
    rating: 5,
  },
  {
    name: "Dr. Priya Nair",
    specialty: "Dermatologist",
    city: "Kochi",
    initials: "PN",
    quote:
      "The image diagnosis feature is remarkably accurate for skin conditions. I uploaded a tricky case of lichen planus and the AI flagged it correctly with 87% confidence. Very impressed.",
    rating: 5,
  },
  {
    name: "Dr. Amitabh Verma",
    specialty: "Radiologist",
    city: "Lucknow",
    initials: "AV",
    quote:
      "As a radiologist in a Tier-2 city, I don't always have peers for second opinions. ShadowMD's radiology AI acts as an intelligent assistant — especially useful for subtle findings on chest X-rays.",
    rating: 5,
  },
  {
    name: "Dr. Sneha Kulkarni",
    specialty: "Pediatrician",
    city: "Pune",
    initials: "SK",
    quote:
      "Parents come with vague symptoms and expect instant answers. ShadowMD helps me structure my differentials quickly and explain findings in Hindi — which my patients really appreciate.",
    rating: 4,
  },
  {
    name: "Dr. Mohammed Irfan",
    specialty: "Orthopedic Surgeon",
    city: "Hyderabad",
    initials: "MI",
    quote:
      "I use the X-ray analysis feature daily for fracture assessments. The AI catches subtle hairline fractures I might miss during a busy clinic. At ₹1,499/month, it's an absolute steal.",
    rating: 5,
  },
  {
    name: "Dr. Kavita Desai",
    specialty: "ENT Specialist",
    city: "Ahmedabad",
    initials: "KD",
    quote:
      "The clinical copilot feature is a game-changer for generating prescriptions and follow-up plans. My documentation time has dropped by 40%. Every doctor in India needs this tool.",
    rating: 5,
  },
];

const LandingTestimonials = () => (
  <section
    className="py-20 md:py-28 px-4 border-t border-border/30"
    aria-labelledby="testimonials-heading"
  >
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-14">
        <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
          Trusted by Real Doctors
        </p>
        <h2
          id="testimonials-heading"
          className="text-3xl md:text-4xl font-bold mb-4"
        >
          What Doctors Across India Are Saying
        </h2>
        <p className="text-muted-foreground max-w-xl mx-auto">
          From general physicians to radiologists — hear how ShadowMD is
          improving clinical decisions in real OPD settings.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {testimonials.map((t) => (
          <article
            key={t.name}
            className="relative rounded-2xl border border-border/50 bg-card/60 p-6 flex flex-col gap-4 hover:border-primary/30 transition-colors"
          >
            <Quote className="absolute top-5 right-5 h-5 w-5 text-primary/20" />

            {/* Stars */}
            <div className="flex gap-0.5" aria-label={`${t.rating} out of 5 stars`}>
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < t.rating
                      ? "fill-warning text-warning"
                      : "text-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            {/* Quote */}
            <blockquote className="text-sm leading-relaxed text-muted-foreground flex-1">
              "{t.quote}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center gap-3 pt-2 border-t border-border/30">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
                  {t.initials}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{t.name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {t.specialty} · {t.city}
                </p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>

    {/* Testimonial schema for SEO */}
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "ShadowMD",
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: "4.8",
            reviewCount: "6",
            bestRating: "5",
          },
          review: testimonials.map((t) => ({
            "@type": "Review",
            author: { "@type": "Person", name: t.name },
            reviewRating: {
              "@type": "Rating",
              ratingValue: String(t.rating),
              bestRating: "5",
            },
            reviewBody: t.quote,
          })),
        }),
      }}
    />
  </section>
);

export default LandingTestimonials;
