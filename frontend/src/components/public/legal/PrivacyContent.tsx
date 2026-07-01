export default function PrivacyContent() {
  return (
    <>
      {/* 1. Introduction */}
      <section>
        <h3>1. Introduction</h3>
        <p className="mt-3 font-body text-body text-gray-600 leading-relaxed">
          This Privacy Policy explains what information Lakshya One (
          <a
            href="https://lakshyaone.com"
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            lakshyaone.com
          </a>
          ) collects, why we collect it, and how it is used and protected.
        </p>
      </section>

      {/* 2. Information we collect */}
      <section>
        <h3>2. Information We Collect</h3>
        <ul className="mt-3 list-disc space-y-2 pl-5 font-body text-body text-gray-600">
          <li>
            <strong>Parents:</strong> name, email, phone number, favourited
            schools, and inquiry history.
          </li>
          <li>
            <strong>Schools:</strong> school profile data (fees,
            facilities, admissions, contact details) and school
            administrator contact information.
          </li>
          <li>
            <strong>Automatically collected:</strong> basic session/cookie
            data and error monitoring data (see Section 4) used to keep
            the platform secure and functioning correctly.
          </li>
        </ul>
      </section>

      {/* 3. How we use information */}
      <section>
        <h3>3. How We Use Information</h3>
        <p className="mt-3 font-body text-body text-gray-600 leading-relaxed">
          We use collected information to match parents with relevant
          schools, deliver inquiries from parents to school administrators,
          maintain account sessions, and improve the platform&apos;s
          functionality and reliability.
        </p>
      </section>

      {/* 4. Data sharing */}
      <section>
        <h3>4. Data Sharing with Third-Party Services</h3>
        <p className="mt-3 font-body text-body text-gray-600 leading-relaxed">
          We use a small number of trusted third-party services to operate
          the platform. These services may process limited data as
          described below:
        </p>
        <ul className="mt-3 list-disc space-y-2 pl-5 font-body text-body text-gray-600">
          <li><strong>Cloudinary</strong> — stores and delivers uploaded images (school logos, cover images, gallery photos).</li>
          <li><strong>Google OAuth</strong> — used if you choose to log in or register with your Google account.</li>
          <li><strong>Sentry</strong> — error monitoring; crash reports may occasionally include technical request data, which we take care to keep free of sensitive personal information.</li>
        </ul>
        <p className="mt-3 font-body text-body text-gray-600 leading-relaxed">
          We do not sell your personal information to any third party.
        </p>
      </section>

      {/* 5. Cookies & sessions */}
      <section>
        <h3>5. Cookies &amp; Sessions</h3>
        <p className="mt-3 font-body text-body text-gray-600 leading-relaxed">
          Lakshya One uses session cookies to keep you logged in and to
          remember your role (Parent, School Admin, or Admin) while you
          use the platform. These cookies are essential for the platform
          to function and are not used for third-party advertising.
        </p>
      </section>

      {/* 6. Data security */}
      <section>
        <h3>6. Data Security</h3>
        <p className="mt-3 font-body text-body text-gray-600 leading-relaxed">
          Passwords are hashed and never stored in plain text. Session
          tokens for platform administrators are stored in HTTP-only
          cookies. Our database connection uses an encrypted connection.
          While we take reasonable steps to protect your data, no system
          can be guaranteed 100% secure.
        </p>
      </section>

      {/* 7. User rights */}
      <section>
        <h3>7. Your Rights</h3>
        <p className="mt-3 font-body text-body text-gray-600 leading-relaxed">
          You may request access to, correction of, or deletion of your
          personal data at any time by contacting us through our{" "}
          <a href="/contact" className="font-medium text-blue-600 hover:text-blue-800">
            Contact page
          </a>{" "}
          or by emailing{" "}
          <a
            href="mailto:info.lakshyaone@gmail.com"
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            info.lakshyaone@gmail.com
          </a>
          .
        </p>
      </section>

      {/* 8. Children's privacy */}
      <section>
        <h3>8. Children&apos;s Privacy</h3>
        <p className="mt-3 font-body text-body text-gray-600 leading-relaxed">
          Lakshya One accounts are intended for parents/guardians and
          school administrators, not for children. Where a school profile
          indirectly references student-related information (for example,
          aggregate student-teacher ratios or total enrollment figures),
          this is general institutional data and does not identify any
          individual child. We do not knowingly collect personal data
          directly from children.
        </p>
      </section>

      {/* 9. Data retention */}
      <section>
        <h3>9. Data Retention</h3>
        <p className="mt-3 font-body text-body text-gray-600 leading-relaxed">
          We retain account and inquiry data for as long as your account
          remains active, or as needed to operate the platform. You may
          request deletion of your data at any time as described in
          Section 7.
        </p>
      </section>

      {/* 10. Changes to this policy */}
      <section>
        <h3>10. Changes to This Policy</h3>
        <p className="mt-3 font-body text-body text-gray-600 leading-relaxed">
          We may update this Privacy Policy from time to time. Material
          changes will be reflected by updating the &quot;Last
          updated&quot; date at the top of this page.
        </p>
      </section>

      {/* 11. Contact */}
      <section>
        <h3>11. Contact</h3>
        <p className="mt-3 font-body text-body text-gray-600 leading-relaxed">
          Questions about this Privacy Policy can be sent through our{" "}
          <a href="/contact" className="font-medium text-blue-600 hover:text-blue-800">
            Contact page
          </a>{" "}
          or by emailing{" "}
          <a
            href="mailto:info.lakshyaone@gmail.com"
            className="font-medium text-blue-600 hover:text-blue-800"
          >
            info.lakshyaone@gmail.com
          </a>
          .
        </p>
      </section>
    </>
  );
}