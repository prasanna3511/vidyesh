import React from "react";
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Send,
} from "lucide-react";

const Contact = () => {
  return (
    <div className="bg-gradient-to-br from-orange-900 via-orange-800 to-red-900 py-16 px-4">
      <div className="container mx-auto max-w-6xl">
        {/* <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            संपर्क साधा
          </h2>
          <p className="text-xl text-orange-100 max-w-2xl mx-auto">
            आपल्या प्रश्नांसाठी किंवा विशेष मागण्यांसाठी आमच्याशी संपर्क साधा
          </p>
        </div> */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-orange-300/20">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Phone className="w-6 h-6 mr-3 text-orange-300" />
                संपर्क माहिती
              </h3>

              <div className="space-y-6">
                <div className="flex items-center group hover:bg-white/5 p-3 rounded-xl transition-all duration-300">
                  <div className="bg-orange-500 p-3 rounded-xl mr-4 group-hover:bg-orange-400 transition-colors">
                    <Phone className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-orange-200 text-sm">फोन</p>
                    <p className="text-white font-semibold">
                      +91 9420 342516 (सर्वेश जोशी){" "}
                    </p>
                  </div>
                </div>

                <div className="flex items-center group hover:bg-white/5 p-3 rounded-xl transition-all duration-300">
                  <div className="bg-orange-500 p-3 rounded-xl mr-4 group-hover:bg-orange-400 transition-colors">
                    <Mail className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-orange-200 text-sm">ईमेल</p>
                    <p className="text-white font-semibold">
                      vidyeshganeshmurti@gmail.com
                    </p>
                  </div>
                </div>

                <a
                  href="https://maps.app.goo.gl/iEYvE3ZBU1LvKY4r9"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block"
                >
                  <div className="flex items-center group hover:bg-white/5 p-3 rounded-xl transition-all duration-300">
                    <div className="bg-orange-500 p-3 rounded-xl mr-4 group-hover:bg-orange-400 transition-colors">
                      <MapPin className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="text-orange-200 text-sm">पत्ता</p>
                      <p className="text-white font-semibold">
                        14, Vidyesh, State Bank Colony, Abhaynagar, Sangli.
                      </p>
                    </div>
                  </div>
                </a>

                <div className="flex items-center group hover:bg-white/5 p-3 rounded-xl transition-all duration-300">
                  <div className="bg-orange-500 p-3 rounded-xl mr-4 group-hover:bg-orange-400 transition-colors">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-orange-200 text-sm">वेळ</p>
                    <p className="text-white font-semibold">
                      सकाळ 8:00 - संध्याकाळ 8:00
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-orange-300/20">
              <h3 className="text-2xl font-bold text-white mb-6">
                सोशल मीडिया
              </h3>
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="bg-blue-600 hover:bg-blue-700 p-3 rounded-xl transition-all duration-300 transform hover:scale-110"
                >
                  <Facebook className="w-5 h-5 text-white" />
                </a>
                <a
                  href="https://www.instagram.com/joshi_business_tales?igsh=MW0xMnQyb3d1bXhpeg=="
                  className="bg-pink-600 hover:bg-pink-700 p-3 rounded-xl transition-all duration-300 transform hover:scale-110"
                >
                  <Instagram className="w-5 h-5 text-white" />
                </a>
                <a
                  href="#"
                  className="bg-blue-400 hover:bg-blue-500 p-3 rounded-xl transition-all duration-300 transform hover:scale-110"
                >
                  <Twitter className="w-5 h-5 text-white" />
                </a>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-orange-300/20">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Send className="w-6 h-6 mr-3 text-orange-300" />
              संदेश पाठवा
            </h3>

            <form className="space-y-6">
              <div>
                <label className="block text-orange-200 text-sm font-medium mb-2">
                  नाव
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-3 bg-white/10 border border-orange-300/30 rounded-xl text-white placeholder-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  placeholder="तुमचे नाव"
                />
              </div>

              <div>
                <label className="block text-orange-200 text-sm font-medium mb-2">
                  फोन नंबर
                </label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 bg-white/10 border border-orange-300/30 rounded-xl text-white placeholder-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  placeholder="तुमचा फोन नंबर"
                />
              </div>

              <div>
                <label className="block text-orange-200 text-sm font-medium mb-2">
                  ईमेल
                </label>
                <input
                  type="email"
                  className="w-full px-4 py-3 bg-white/10 border border-orange-300/30 rounded-xl text-white placeholder-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300"
                  placeholder="तुमचा ईमेल"
                />
              </div>

              <div>
                <label className="block text-orange-200 text-sm font-medium mb-2">
                  संदेश
                </label>
                <textarea
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border border-orange-300/30 rounded-xl text-white placeholder-orange-300/50 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-300 resize-none"
                  placeholder="तुमचा संदेश..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>संदेश पाठवा</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-orange-300/20 text-center">
          <p className="text-orange-200 text-lg">
            गणपती बाप्पा मोरया! मंगलमूर्ती मोरया!
          </p>
          <p className="text-orange-300/60 text-sm mt-2">
            © Vidyesh Ganeshmurti 2025, All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
