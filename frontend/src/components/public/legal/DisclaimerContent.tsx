export default function DisclaimerContent() {
  return (
    <>
      {/* 1. Purpose */}
      <section>
        <h3>1. Purpose of This Page</h3>
        <p className="mt-3 font-body text-body text-gray-600 leading-relaxed">
          Lakshya One (
          <a
            href="https://lakshyaone.com"
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            lakshyaone.com
          </a>
          ) is a school discovery platform. This page explains where our
          school listing data comes from, what it does and doesn&apos;t
          represent, and how you can help us keep it accurate.
        </p>
      </section>

      {/* 2. Data sourcing statement — core clause */}
      <section>
        <h3>2. Data Sourcing Statement</h3>
        <div className="alert-info mt-3 space-y-3">
          <p className="font-body text-body leading-relaxed">
            Lakshya One&apos;s Phase 1 launch (Prayagraj district) includes
            school listings compiled from publicly available information,
            including each school&apos;s own website, other third-party
            websites and directories, and publicly accessible information
            available via Google Search and Google Maps.
          </p>
          <p className="font-body text-body leading-relaxed">
            This data has <strong>not been submitted or verified by the
            school itself</strong>, unless explicitly marked as such on the
            school&apos;s profile page.
          </p>
          <p className="font-body text-body leading-relaxed">
            Information such as fees, facilities, admission dates, and
            contact details may be outdated or inaccurate, as it reflects
            publicly available information as of the date of collection —
            not real-time data.
          </p>
        </div>
      </section>

      {/* 3. Verified vs unverified */}
      <section>
        <h3>3. Verified vs. Unverified Listings</h3>
        <p className="mt-3 font-body text-body text-gray-600 leading-relaxed">
          Some listings on Lakshya One are compiled from publicly available
          sources, as described above, and are not yet confirmed by the
          school. Schools that register directly on the platform and
          confirm their own information are marked accordingly on their
          profile page. Where no such confirmation is shown, treat the
          listed details as publicly sourced and subject to change.
        </p>
      </section>

      {/* 4. No guarantee of accuracy */}
      <section>
        <h3>4. No Guarantee of Accuracy</h3>
        <p className="mt-3 font-body text-body text-gray-600 leading-relaxed">
          Lakshya One does not guarantee that listed information is
          current, complete, or error-free. Parents are encouraged to
          verify important details — such as fees, admission timelines,
          and facilities — directly with the school before making any
          decision.
        </p>
      </section>

      {/* 5. How to report or correct */}
      <section>
        <h3>5. How to Report or Correct Information</h3>
        <p className="mt-3 font-body text-body text-gray-600 leading-relaxed">
          If you are a school representative, parent, or visitor and
          notice incorrect information on a listing, please reach out via
          our{" "}
          <a href="/contact" className="font-medium text-blue-600 hover:text-blue-800">
            Contact page
          </a>{" "}
          or email us at{" "}
          <a
            href="mailto:info.lakshyaone@gmail.com"
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            info.lakshyaone@gmail.com
          </a>
          , and we will review and update the listing promptly.
        </p>
      </section>

      {/* 6. No endorsement */}
      <section>
        <h3>6. No Endorsement</h3>
        <p className="mt-3 font-body text-body text-gray-600 leading-relaxed">
          A school appearing on Lakshya One does not mean Lakshya One
          endorses, recommends, or is affiliated with that school. Listings
          are provided purely for informational and discovery purposes.
        </p>
      </section>

      {/* 7. Limitation of liability */}
      <section>
        <h3>7. Limitation of Liability</h3>
        <p className="mt-3 font-body text-body text-gray-600 leading-relaxed">
          Lakshya One is provided on an &quot;as-is&quot; basis and is not
          liable for decisions made based on listed information. See our{" "}
          <a href="/terms" className="font-medium text-blue-600 hover:text-blue-800">
            Terms of Service
          </a>{" "}
          for the full liability clause.
        </p>
      </section>
    </>
  );
}