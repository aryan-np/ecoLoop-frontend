import React from "react";
import { useNavigate } from "react-router-dom";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <div className="bg-white rounded-lg shadow-sm p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms and Conditions for Eco Loop</h1>
        <p className="text-gray-500 mb-8">Last Updated: May 2026</p>

        <div className="prose prose-sm max-w-none text-gray-700 space-y-6">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Introduction</h2>
            <p>
              Eco Loop is a web-based circular economy platform designed to support:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Reuse and resale of second-hand items</li>
              <li>Recycling and scrap collection services</li>
              <li>Donation of usable goods to NGOs</li>
              <li>Environmental impact tracking and analytics</li>
            </ul>
            <p>The platform connects Buyers, Sellers, Donors, Recyclers, NGOs, and Administrators within Kathmandu Valley.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Eligibility</h2>
            <p>By using Eco Loop, you confirm that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You are legally allowed to use online platforms under applicable laws.</li>
              <li>The information you provide during registration is accurate and up to date.</li>
              <li>You will maintain the confidentiality of your account credentials.</li>
            </ul>
            <p>Users may register using email, phone number, OTP verification, and password authentication.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. User Accounts</h2>
            <p>Users are responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintaining account security</li>
              <li>Protecting JWT authentication tokens</li>
              <li>All activities performed under their account</li>
            </ul>
            <p>Eco Loop reserves the right to suspend or terminate accounts involved in fraud, abuse, spam, harassment, or policy violations.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. User Roles</h2>
            <p>The platform supports multiple user roles, including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Buyer</li>
              <li>Seller</li>
              <li>Donor</li>
              <li>Recycler</li>
              <li>NGO</li>
              <li>Admin</li>
            </ul>
            <p>Certain roles such as Recycler and NGO require administrative verification before approval.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Marketplace Rules</h2>
            <p>When listing items in the reuse marketplace, users must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate descriptions and images</li>
              <li>Avoid listing illegal, harmful, counterfeit, or prohibited products</li>
              <li>Clearly state item condition and pricing</li>
              <li>Only upload content they own or have permission to use</li>
            </ul>
            <p>Eco Loop does not guarantee the quality, safety, or authenticity of listed items. Users are solely responsible for transactions conducted through the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">6. Recycling Services</h2>
            <p>Users submitting scrap pickup requests must:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide accurate location and scrap details</li>
              <li>Ensure recyclable materials are lawful and safe to collect</li>
              <li>Coordinate pickup timing responsibly</li>
            </ul>
            <p>Recyclers may accept or reject pickup requests based on operational availability.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">7. Donations and NGO Verification</h2>
            <p>NGOs using the donation system must provide:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Valid registration documents</li>
              <li>Accurate contact information</li>
              <li>Proof of authenticity</li>
            </ul>
            <p>Eco Loop may verify submitted NGO documents before assigning verified status. Donors acknowledge that donated items are transferred voluntarily without expectation of compensation.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">8. Messaging and Communication</h2>
            <p>Users must not use the platform messaging system to:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Harass or threaten others</li>
              <li>Share fraudulent or misleading information</li>
              <li>Send spam or harmful content</li>
              <li>Conduct illegal activities</li>
            </ul>
            <p>Eco Loop reserves the right to monitor, review, and moderate reports of inappropriate behavior.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">9. Ratings, Reviews, and Reports</h2>
            <p>Users may rate and review each other after completed transactions. Reviews must be:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Honest</li>
              <li>Respectful</li>
              <li>Relevant to the transaction</li>
            </ul>
            <p>False reporting, abusive reviews, or manipulation of ratings may result in account restrictions.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">10. Privacy and Data Security</h2>
            <p>Eco Loop implements security measures including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Password hashing</li>
              <li>JWT authentication</li>
              <li>Role-based access control</li>
              <li>Data encryption for protected routes</li>
            </ul>
            <p>However, no online platform can guarantee absolute security. Users are responsible for safeguarding their own devices and credentials.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">11. Intellectual Property</h2>
            <p>All platform branding, UI elements, system architecture, and original content related to Eco Loop remain the intellectual property of the project owners unless otherwise stated.</p>
            <p>Users retain ownership of the content they upload but grant Eco Loop permission to display and process that content within the platform.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">12. Limitation of Liability</h2>
            <p>Eco Loop acts as an intermediary platform and is not responsible for:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>User disputes</li>
              <li>Damaged or lost items</li>
              <li>Failed transactions</li>
              <li>Pickup delays</li>
              <li>Misrepresentation by users</li>
              <li>Third-party API failures</li>
            </ul>
            <p>Use of the platform is at the user's own risk.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">13. Suspension and Termination</h2>
            <p>Eco Loop may suspend or terminate accounts that:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Violate these Terms</li>
              <li>Engage in fraud or abuse</li>
              <li>Upload prohibited content</li>
              <li>Attempt unauthorized access to the system</li>
            </ul>
            <p>Administrators reserve the right to investigate reported incidents.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">14. External Services</h2>
            <p>The platform may rely on third-party services including:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Google Maps API</li>
              <li>Firebase Notifications</li>
            </ul>
            <p>Availability of some features may depend on these external providers.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">15. Changes to Terms</h2>
            <p>Eco Loop reserves the right to update or modify these Terms and Conditions at any time. Continued use of the platform after changes are published constitutes acceptance of the revised terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">16. Contact</h2>
            <p>For questions, disputes, or support regarding these Terms and Conditions, users may contact the Eco Loop administration team through the official platform communication channels.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
