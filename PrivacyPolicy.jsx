import React from 'react'
import styles from './PrivacyPolicy.module.css'

export default function PrivacyPolicy() {
  return (
    <div className={styles.container}>
      <div className={styles.privacyBox}>
        
        {/* ХЕДЕР СТРАНИЦЫ */}
        <div className={styles.headerRow}>
          <h1 className={styles.title}>Privacy Statement</h1>
          <div className={styles.updateDate}>Last Updated: August 2026</div>
        </div>

        <p className={styles.introText}>
          This Privacy Statement explains our practices regarding the collection, use, and disclosure of certain information, including your personal information in connection with your interaction with Murflix websites.
        </p>

        {/* РАЗДЕЛ 1 */}
        <div className={styles.sectionBlock}>
          <h2 className={styles.subTitle}>1. Collection of Information</h2>
          <p>We receive and store information about you such as:</p>
          <ul className={styles.bullets}>
            <li><strong>Information you provide to us:</strong> Your name, username, password and email address used during registration.</li>
            <li><strong>Information we collect automatically:</strong> Device IDs, software characteristics, IP address (which tells us your general location), and your streaming activity history.</li>
          </ul>
        </div>

        {/* РАЗДЕЛ 2 */}
        <div className={styles.sectionBlock}>
          <h2 className={styles.subTitle}>2. Use of Information</h2>
          <p>We use this information to provide, analyze, administer, and enhance your experience on Murflix. For example, we use it to:</p>
          <ul className={styles.bullets}>
            <li>Determine your general geographic location to localize the streaming content.</li>
            <li>Secure our systems, prevent fraud, and protect the security of our player and user accounts.</li>
            <li>Analyze and understand our audience to improve our media grids and carousel rows.</li>
          </ul>
        </div>

        {/* РАЗДЕЛ 3 */}
        <div className={styles.sectionBlock}>
          <h2 className={styles.subTitle}>3. Security & Safety</h2>
          <p>
            We use reasonable administrative, logical, and physical measures to safeguard your personal information against loss, theft and unauthorized modification. Unfortunately, no measures can be guaranteed to provide 100% security, but we do our best to encrypt your data safely.
          </p>
        </div>

      </div>
    </div>
  )
}
