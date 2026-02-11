const mongoose = require('mongoose');
const Contact = require('../models/contact.model');
const User = require('../models/user.model');

async function createContact(ownerId, { contactEmail, contactId, nickname }) {
  let targetUser;

  if (contactEmail) {
    targetUser = await User.findOne({ email: contactEmail });
    if (!targetUser) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
  } else {
    if (!mongoose.Types.ObjectId.isValid(contactId)) {
      const err = new Error('Invalid contactId');
      err.status = 400;
      throw err;
    }
    targetUser = await User.findById(contactId);
    if (!targetUser) {
      const err = new Error('User not found');
      err.status = 404;
      throw err;
    }
  }

  if (targetUser._id.equals(ownerId)) {
    const err = new Error('Cannot add yourself as contact');
    err.status = 400;
    throw err;
  }

  const exists = await Contact.exists({ ownerId, contactId: targetUser._id });
  if (exists) {
    const err = new Error('Contact already exists');
    err.status = 409;
    throw err;
  }

  const contact = new Contact({
    ownerId,
    contactId: targetUser._id,
    nickname: nickname || null
  });

  await contact.save();
  await contact.populate({ path: 'contactId', select: 'username email avatarUrl' });
  return contact.toObject();
}

async function listContacts(ownerId) {
  const docs = await Contact.find({ ownerId }).sort({ createdAt: -1 }).populate({ path: 'contactId', select: 'username email avatarUrl' }).exec();
  return docs.map(d => d.toObject());
}

async function getContactById(ownerId, contactRecordId) {
  if (!mongoose.Types.ObjectId.isValid(contactRecordId)) {
    const err = new Error('Invalid id');
    err.status = 400;
    throw err;
  }
  const doc = await Contact.findOne({ _id: contactRecordId, ownerId }).populate({ path: 'contactId', select: 'username email avatarUrl' }).exec();
  if (!doc) {
    const err = new Error('Contact not found');
    err.status = 404;
    throw err;
  }
  return doc.toObject();
}

async function deleteContact(ownerId, contactRecordId) {
  if (!mongoose.Types.ObjectId.isValid(contactRecordId)) {
    const err = new Error('Invalid id');
    err.status = 400;
    throw err;
  }
  const doc = await Contact.findOneAndDelete({ _id: contactRecordId, ownerId }).exec();
  if (!doc) {
    const err = new Error('Contact not found');
    err.status = 404;
    throw err;
  }
  return { message: 'Contact deleted' };
}

module.exports = {
  createContact,
  listContacts,
  getContactById,
  deleteContact
};
