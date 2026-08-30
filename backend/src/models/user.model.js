import mongoose from "mongoose";
import bcrypt from "bcrypt"


const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // never return password by default
    },
    // Used for asthma/respiratory alerts (Phase 2 - Twilio/SMS)
    phone: {
      type: String,
      default: null,
    },
    isSensitiveGroup: {
      type: Boolean,
      default: false, // e.g. asthma/respiratory patients opting into alerts
    },
    // Credibility score for noise complaints, starts neutral
    credibilityScore: {
      type: Number,
      default: 50,
      min: 0,
      max: 100,
    },
    lastKnownLocation: {
      latitude: { type: Number, default: null },
      longitude: { type: Number, default: null },
      updatedAt: { type: Date, default: null },
    },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Instance method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;