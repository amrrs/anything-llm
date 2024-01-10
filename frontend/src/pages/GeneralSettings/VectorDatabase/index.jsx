import React, { useState, useEffect } from "react";
import Sidebar from "@/components/SettingsSidebar";
import System from "@/models/system";
import showToast from "@/utils/toast";
import ChromaLogo from "@/assets/vectordbs/chroma.png";
import PineconeLogo from "@/assets/vectordbs/pinecone.png";
import LanceDbLogo from "@/assets/vectordbs/lancedb.png";
import WeaviateLogo from "@/assets/vectordbs/weaviate.png";
import QDrantLogo from "@/assets/vectordbs/qdrant.png";
import PreLoader from "@/components/Preloader";
import ChangeWarningModal from "@/components/ChangeWarning";
import { MagnifyingGlass } from "@phosphor-icons/react";
import LanceDBOptions from "@/components/VectorDBSelection/LanceDBOptions";
import ChromaDBOptions from "@/components/VectorDBSelection/ChromaDBOptions";
import PineconeDBOptions from "@/components/VectorDBSelection/PineconeDBOptions";
import QDrantDBOptions from "@/components/VectorDBSelection/QDrantDBOptions";
import WeaviateDBOptions from "@/components/VectorDBSelection/WeaviateDBOptions";
import VectorDBItem from "@/components/VectorDBSelection/VectorDBItem";

export default function GeneralVectorDatabase() {
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [hasEmbeddings, setHasEmbeddings] = useState(false);
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredVDBs, setFilteredVDBs] = useState([]);
  const [selectedVDB, setSelectedVDB] = useState(null);

  useEffect(() => {
    async function fetchKeys() {
      const _settings = await System.keys();
      console.log(_settings);
      setSettings(_settings);
      setSelectedVDB(_settings?.VectorDB || "lancedb");
      setHasEmbeddings(_settings?.HasExistingEmbeddings || false);
      setLoading(false);
    }
    fetchKeys();
  }, []);

  const VECTOR_DBS = [
    {
      name: "LanceDB",
      value: "lancedb",
      logo: LanceDbLogo,
      options: <LanceDBOptions />,
      description:
        "100% local vector DB that runs on the same instance as AnythingLLM.",
    },
    {
      name: "Chroma",
      value: "chroma",
      logo: ChromaLogo,
      options: <ChromaDBOptions settings={settings} />,
      description:
        "Open source vector database you can host yourself or on the cloud.",
    },
    {
      name: "Pinecone",
      value: "pinecone",
      logo: PineconeLogo,
      options: <PineconeDBOptions settings={settings} />,
      description: "100% cloud-based vector database for enterprise use cases.",
    },
    {
      name: "QDrant",
      value: "qdrant",
      logo: QDrantLogo,
      options: <QDrantDBOptions settings={settings} />,
      description: "Open source local and distributed cloud vector database.",
    },
    {
      name: "Weaviate",
      value: "weaviate",
      logo: WeaviateLogo,
      options: <WeaviateDBOptions settings={settings} />,
      description:
        "Open source local and cloud hosted multi-modal vector database.",
    },
  ];

  const updateVectorChoice = (selection) => {
    setHasChanges(true);
    setSelectedVDB(selection);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedVDB !== settings?.VectorDB && hasChanges && hasEmbeddings) {
      document.getElementById("confirmation-modal")?.showModal();
    } else {
      await handleSaveSettings();
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    const form = document.getElementById("vectordb-form");
    const settingsData = {};
    const formData = new FormData(form);
    settingsData.VectorDB = selectedVDB;
    for (var [key, value] of formData.entries()) settingsData[key] = value;

    const { error } = await System.updateSystem(settingsData);
    if (error) {
      showToast(`Failed to save vector database settings: ${error}`, "error");
      setHasChanges(true);
    } else {
      showToast("Vector database preferences saved successfully.", "success");
      setHasChanges(false);
    }
    setSaving(false);
    document.getElementById("confirmation-modal")?.close();
  };

  useEffect(() => {
    const filtered = VECTOR_DBS.filter((vdb) =>
      vdb.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredVDBs(filtered);
  }, [searchQuery, selectedVDB]);

  return (
    <div
      style={{ height: "calc(100vh - 40px)" }}
      className="w-screen overflow-hidden bg-sidebar flex"
    >
      <ChangeWarningModal
        warningText="Switching the vector database will ignore previously embedded documents and future similarity search results. They will need to be re-added to each workspace."
        onClose={() => document.getElementById("confirmation-modal")?.close()}
        onConfirm={handleSaveSettings}
      />
      <Sidebar />
      {loading ? (
        <div className="transition-all duration-500 relative ml-[2px] mr-[16px] my-[16px] md:rounded-[26px] bg-main-gradient w-full h-[93vh] overflow-y-scroll border-4 border-accent">
          <div className="w-full h-full flex justify-center items-center">
            <PreLoader />
          </div>
        </div>
      ) : (
        <div className="transition-all duration-500 relative ml-[2px] mr-[16px] my-[16px] md:rounded-[26px] bg-main-gradient w-full h-[93vh] overflow-y-scroll border-4 border-accent">
          <form
            id="vectordb-form"
            onSubmit={handleSubmit}
            className="flex w-full"
          >
            <div className="flex flex-col w-full px-1 md:px-20 md:py-12 py-16">
              <div className="w-full flex flex-col gap-y-1 pb-6 border-white border-b-2 border-opacity-10">
                <div className="items-center flex gap-x-4">
                  <p className="text-2xl font-semibold text-white">
                    Vector Database
                  </p>
                  {hasChanges && (
                    <button
                      type="submit"
                      disabled={saving}
                      className="border border-slate-200 px-4 py-1 rounded-lg text-slate-200 text-sm items-center flex gap-x-2 hover:bg-slate-200 hover:text-slate-800"
                    >
                      {saving ? "Saving..." : "Save changes"}
                    </button>
                  )}
                </div>
                <p className="text-sm font-base text-white text-opacity-60">
                  These are the credentials and settings for how your
                  AnythingLLM instance will function. It's important these keys
                  are current and correct.
                </p>
              </div>
              <div className="text-white text-sm font-medium py-4">
                Select your preferred vector database provider
              </div>
              <div className="w-full">
                <div className="w-full relative border-slate-300/20 shadow border-4 rounded-xl text-white">
                  <div className="w-full p-4 absolute top-0 rounded-t-lg backdrop-blur-sm">
                    <div className="w-full flex items-center sticky top-0 z-20">
                      <MagnifyingGlass
                        size={16}
                        weight="bold"
                        className="absolute left-4 z-30 text-white"
                      />
                      <input
                        type="text"
                        placeholder="Search vector databases"
                        className="border-none bg-zinc-600 z-20 pl-10 rounded-full w-full px-4 py-1 text-sm border-2 border-slate-300/40 outline-none focus:border-white text-white"
                        onChange={(e) => {
                          e.preventDefault();
                          setSearchQuery(e.target.value);
                        }}
                        autoComplete="off"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") e.preventDefault();
                        }}
                      />
                    </div>
                  </div>
                  <div className="px-4 pt-[70px] flex flex-col gap-y-1 max-h-[390px] overflow-y-auto no-scroll pb-4">
                    {filteredVDBs.map((vdb) => (
                      <VectorDBItem
                        key={vdb.name}
                        name={vdb.name}
                        value={vdb.value}
                        image={vdb.logo}
                        description={vdb.description}
                        checked={selectedVDB === vdb.value}
                        onClick={() => updateVectorChoice(vdb.value)}
                      />
                    ))}
                  </div>
                </div>
                <div
                  onChange={() => setHasChanges(true)}
                  className="mt-4 flex flex-col gap-y-1"
                >
                  {selectedVDB &&
                    VECTOR_DBS.find((vdb) => vdb.value === selectedVDB)
                      ?.options}
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
