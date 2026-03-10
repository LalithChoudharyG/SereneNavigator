export default function AboutPage() {
  return (
    <main style={{ padding: 24, maxWidth: 900, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700 }}>About</h1>

      <p style={{ marginTop: 10 }}>
        Travel Advisor is a one-stop hub for travel safety, health, and emergency guidance by
        destination. It helps you quickly find key information before and during a trip.
      </p>

      <section style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>What you can find here</h2>
        <ul style={{ marginTop: 10, paddingLeft: 18, lineHeight: 1.6 }}>
          <li>Safety overview and advisory context</li>
          <li>Health reminders (vaccines, water/food precautions, common risks)</li>
          <li>Emergency numbers and basic emergency planning info</li>
          <li>Destination-friendly tips (culture and practical travel notes)</li>
        </ul>
      </section>

      <section style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Important disclaimers</h2>
        <ul style={{ marginTop: 10, paddingLeft: 18, lineHeight: 1.6 }}>
          <li>
            This app is for general informational purposes only. It is not medical advice, legal
            advice, or a substitute for professional guidance.
          </li>
          <li>
            Travel conditions can change quickly. Always verify critical information through official
            sources before making decisions.
          </li>
          <li>
            In an emergency, contact local emergency services immediately.
          </li>
        </ul>
      </section>

      <section style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Data sources</h2>
        <p style={{ marginTop: 10, lineHeight: 1.6 }}>
          Sources may vary by destination and availability. When possible, the app pulls from trusted
          public sources and caches results to improve speed.
        </p>

        <ul style={{ marginTop: 10, paddingLeft: 18, lineHeight: 1.6 }}>
          <li>U.S. Department of State travel advisories (when available)</li>
          <li>Emergency number sources and official government references (when available)</li>
          <li>Country facts from public datasets (where applicable)</li>
          <li>Some destination content is currently curated placeholder data during the MVP phase</li>
        </ul>
      </section>

      <section style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Updates and caching</h2>
        <p style={{ marginTop: 10, lineHeight: 1.6 }}>
          To keep pages fast and reduce repeated calls to external services, some results are cached
          and may not reflect minute-by-minute changes. Where dates are shown (e.g., “Updated”), use
          them as a reference point.
        </p>
      </section>

      <section style={{ marginTop: 22 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Feedback</h2>
        <p style={{ marginTop: 10, lineHeight: 1.6 }}>
          If you notice missing information or a mismatch for a destination, you can track it as an
          improvement item for the next iteration of the MVP.
        </p>
      </section>
    </main>
  );
}