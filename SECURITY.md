# Security Best Practices

## 🔒 Protecting Sensitive Information

### Critical Rules

1. **NEVER commit `.env` files to Git**
   - All `.env` files are in `.gitignore`
   - Use `.env.example` as templates
   - Each developer should create their own `.env` files

2. **NEVER hardcode credentials in code**
   - Always use environment variables
   - Backend: `process.env.VARIABLE_NAME`
   - Frontend: `import.meta.env.VITE_VARIABLE_NAME`

3. **Keep documentation generic**
   - Use placeholders like `your_api_key_here`
   - Never paste real credentials in docs
   - Review all `.md` files before committing

### Environment Variables Checklist

**Backend (.env):**
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname

# Firebase Admin
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk@your-project.iam.gserviceaccount.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT
JWT_SECRET=your_random_secret_key
```

**Frontend (.env):**
```bash
# API
VITE_API_URL=http://localhost:5000/api

# Firebase
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Cloudinary
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name
```

## 🚨 If Credentials Are Exposed

### If you accidentally commit a `.env` file:

1. **Immediately rotate all credentials:**
   - MongoDB: Change database password in Atlas
   - Firebase: Regenerate service account key
   - Cloudinary: Reset API secret
   - JWT: Generate new secret

2. **Remove from Git history:**
   ```powershell
   # WARNING: This rewrites history
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/.env frontend/.env" \
     --prune-empty --tag-name-filter cat -- --all
   
   git push origin --force --all
   ```

3. **Add to `.gitignore` and commit:**
   ```powershell
   git add .gitignore
   git commit -m "Add .env to .gitignore"
   git push
   ```

### If credentials appear in public repository:

1. **Consider all credentials compromised**
2. **Rotate everything immediately**
3. **Monitor for unauthorized access**
4. **Review access logs in each service**

## 🛡️ Pre-Commit Security Checklist

Before every commit, verify:

- [ ] No `.env` files in staged changes (`git status`)
- [ ] Documentation has no real credentials
- [ ] All API keys use placeholders
- [ ] Test files don't expose secrets
- [ ] Config files reference environment variables

### Quick Check Command:
```powershell
# Check for any .env files in staging area
git diff --cached --name-only | Select-String -Pattern "\.env"

# Should return nothing - if it finds files, DON'T COMMIT
```

## 🔐 Additional Security Measures

### 1. Use Git Hooks (Optional)
Create `.git/hooks/pre-commit`:
```bash
#!/bin/sh
if git diff --cached --name-only | grep -q ".env$"; then
  echo "ERROR: Attempting to commit .env file!"
  exit 1
fi
```

### 2. Enable 2FA
- MongoDB Atlas: Enable 2-factor authentication
- Firebase: Enable 2-step verification
- Cloudinary: Enable 2FA in security settings
- GitHub: Enable 2FA for your account

### 3. Regular Security Audits
- Review access logs monthly
- Rotate credentials every 90 days
- Remove unused API keys
- Monitor usage dashboards

### 4. Production vs Development
- Use separate credentials for prod/dev
- Never use production credentials locally
- Keep production `.env` on secure servers only

## 📚 References

- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
- [MongoDB Atlas Security](https://www.mongodb.com/docs/atlas/security/)
- [Firebase Security](https://firebase.google.com/docs/rules)
- [Cloudinary Security](https://cloudinary.com/documentation/security)

---

**Remember: Security is not a one-time task. Review these practices regularly!** 🔒
