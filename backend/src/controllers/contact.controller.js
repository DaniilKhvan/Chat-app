const contactService = require('../services/contact.service');

async function create(req, res, next) {
  try {
    const ownerId = req.user._id;
    const payload = req.validatedBody;
    const contact = await contactService.createContact(ownerId, payload);
    res.status(201).json(contact);
  } catch (err) {
    next(err);
  }
}

async function list(req, res, next) {
  try {
    const ownerId = req.user._id;
    const contacts = await contactService.listContacts(ownerId);
    res.json(contacts);
  } catch (err) {
    next(err);
  }
}

async function getById(req, res, next) {
  try {
    const ownerId = req.user._id;
    const id = req.params.id;
    const contact = await contactService.getContactById(ownerId, id);
    res.json(contact);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const ownerId = req.user._id;
    const id = req.params.id;
    const result = await contactService.deleteContact(ownerId, id);
    res.json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { create, list, getById, remove };
