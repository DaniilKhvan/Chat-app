const Reaction = require('../models/reaction.model');
const Message = require('../models/message.model');

exports.getReactions = async (req, res) => {
  const { messageId } = req.params;
  
  try {
    const reactions = await Reaction.find({ messageId }).populate('userId', 'username email');
    const summary = {};
    
    reactions.forEach(r => {
      const emoji = r.emoji;
      if (!summary[emoji]) {
        summary[emoji] = {
          emoji: emoji,
          count: 0,
          reacted: false,
          users: [] // опционально: список пользователей
        };
      }
      summary[emoji].count += 1;
      
      // Проверяем, поставил ли текущий пользователь эту реакцию
      if (r.userId && r.userId._id.toString() === req.user.id) {
        summary[emoji].reacted = true;
        summary[emoji].reactionId = r._id; // добавляем ID реакции для удаления
      }
      
      // Добавляем информацию о пользователе
      if (r.userId) {
        summary[emoji].users.push({
          userId: r.userId._id,
          username: r.userId.username
        });
      }
    });
    
    // Преобразуем объект в массив для фронтенда
    const result = Object.values(summary);
    res.json(result);
    
  } catch (error) {
    console.error('Error getting reactions:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addReaction = async (req, res) => {
  const { messageId } = req.params;
  const { emoji } = req.body;
  
  try {
    // Проверяем существование сообщения
    const message = await Message.findById(messageId);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }
    
    // Проверяем, есть ли уже такая реакция от пользователя
    const existing = await Reaction.findOne({
      messageId,
      userId: req.user.id,
      emoji
    });
    
    if (existing) {
      return res.status(409).json({ message: 'Reaction already exists' });
    }
    
    // Создаем новую реакцию
    const reaction = await Reaction.create({
      messageId,
      userId: req.user.id,
      emoji
    });
    
    // Возвращаем полную информацию о реакции
    const populated = await Reaction.findById(reaction._id)
      .populate('userId', 'username email');
    
    res.status(201).json(populated);
    
  } catch (error) {
    console.error('Error adding reaction:', error);
    
    // Обработка ошибок валидации MongoDB
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: 'Invalid reaction data' });
    }
    
    if (error.code === 11000) {
      return res.status(409).json({ message: 'Reaction already exists' });
    }
    
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteReaction = async (req, res) => {
  const { messageId, reactionId } = req.params;
  
  try {
    // Проверяем, это ObjectId или emoji?
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(reactionId);
    
    let reaction;
    if (isObjectId) {
      // Если это ObjectId, ищем по ID
      reaction = await Reaction.findById(reactionId);
    } else {
      // Если это emoji, ищем по комбинации messageId, userId и emoji
      reaction = await Reaction.findOne({
        messageId,
        userId: req.user.id,
        emoji: reactionId
      });
    }
    
    if (!reaction) {
      return res.status(404).json({ message: 'Reaction not found' });
    }
    
    // Проверяем права (только свой реакции или админ)
    if (reaction.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Forbidden' });
    }
    
    await reaction.deleteOne();
    res.json({ message: 'Reaction deleted' });
    
  } catch (error) {
    console.error('Error deleting reaction:', error);
    res.status(500).json({ message: 'Server error' });
  }
};